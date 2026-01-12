const Order = require("../models/Order-Model");
const Payment = require("../models/Payment-Model");
const Table = require("../models/Table-Model");
const User = require("../models/User-Model");
const Product = require("../models/Products-Model");
const Category = require("../models/Category-Model");

const toYMD = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

// URL: GET /api/admin/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
//Permission: dashboard.read
const dashboardOverview = async (req, res) => {
    try {
        const { from, to, preset } = req.query;

        const now = new Date();
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

        // preset supported:
        // - today, yesterday
        // - 3d, 7d, 10d, 20d, 30d
        // - this_month
        const presetDaysMap = {
            "3d": 3,
            "7d": 7,
            "10d": 10,
            "20d": 20,
            "30d": 30,
        };

        let start;
        let end;

        if (preset === "today") {
            start = startOfToday;
            end = endOfToday;
        } else if (preset === "yesterday") {
            start = new Date(startOfToday);
            start.setDate(start.getDate() - 1);
            end = new Date(endOfToday);
            end.setDate(end.getDate() - 1);
        } else if (preset === "this_month") {
            start = startOfThisMonth;
            end = endOfToday;
        } else if (preset && presetDaysMap[preset]) {
            const days = presetDaysMap[preset];
            // inclusive range: today + previous (days - 1) days
            start = new Date(startOfToday);
            start.setDate(start.getDate() - (days - 1));
            end = endOfToday;
        } else {
            start = from
                ? new Date(from)
                : startOfToday;

            end = to
                ? new Date(new Date(to).setHours(23, 59, 59, 999))
                : endOfToday;
        }

        /* ================= PARALLEL QUERIES (FAST) ================= */
        const [
            totalOrders,
            paidOrders,
            unpaidOrders,
            staffOnDuty,
            totalTables,
            occupiedTables,
            availableTables,
            tables,
            totalProducts,
            activeProducts,
            totalCategories,
            activeCategories,
            payments,
            totalSalesAgg,
            orderStatusRaw,
            salesGraphRaw,
            topItems,
            recentOrders,
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            Order.countDocuments({ paymentStatus: "paid", createdAt: { $gte: start, $lte: end } }),
            Order.countDocuments({ paymentStatus: "unpaid", createdAt: { $gte: start, $lte: end } }),

            User.countDocuments({ role: "cashier", isActive: true }),

            Table.countDocuments(),
            Table.countDocuments({ status: "occupied" }),
            Table.countDocuments({ status: "available" }),
            Table.find({}, "tableNumber floor status").sort({ floor: 1, tableNumber: 1 }).lean(),

            Product.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Category.countDocuments(),
            Category.countDocuments({ isActive: true }),

            Payment.aggregate([
                { $match: { paidAt: { $gte: start, $lte: end } } },
                { $group: { _id: "$method", total: { $sum: "$amount" } } }
            ]),

            Order.aggregate([
                {
                    $match: {
                        paymentStatus: "paid",
                        createdAt: { $gte: start, $lte: end }
                    }
                },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),

            Order.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
            ]),

            Order.aggregate([
                {
                    $match: {
                        paymentStatus: "paid",
                        createdAt: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                            }
                        },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id.day": 1 } }
            ]),

            Order.aggregate([
                { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
                { $unwind: "$items" },
                { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
                { $sort: { quantity: -1 } },
                { $limit: 8 }
            ]),

            Order.find({ createdAt: { $gte: start, $lte: end } })
                .sort({ createdAt: -1 })
                .limit(12)
                .select("createdAt tableId orderStatus paymentStatus paymentMethod totalAmount items")
                .populate("tableId", "tableNumber floor")
                .lean(),
        ]);

        const totalSales = totalSalesAgg?.[0]?.total || 0;

        const paymentSummary = { cash: 0, upi: 0, card: 0 };
        (payments || []).forEach(p => {
            if (p && p._id) paymentSummary[p._id] = p.total;
        });

        // Always return all statuses (UI should not look empty)
        const ORDER_STATUSES = ["open", "billed", "closed"];
        const orderStatusMap = {};
        (orderStatusRaw || []).forEach((s) => {
            if (s && s._id) orderStatusMap[s._id] = s.count || 0;
        });
        const orderStatusNormalized = ORDER_STATUSES.map((s) => ({
            _id: s,
            count: orderStatusMap[s] || 0
        }));




        /* ================= SALES GRAPH (RANGE BASED) ================= */
        const salesGraph = salesGraphRaw.map(d => ({
            date: d._id.day,
            amount: d.total
        }));

        // Fill missing dates (keeps line chart continuous).
        // To avoid heavy computation on huge custom ranges, only fill up to 370 days.
        const startDay = new Date(new Date(start).setHours(0, 0, 0, 0));
        const endDay = new Date(new Date(end).setHours(0, 0, 0, 0));
        const diffDays = Math.floor((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;
        let salesGraphFilled = salesGraph;
        if (diffDays > 0 && diffDays <= 370) {
            const salesMap = new Map(salesGraph.map((d) => [d.date, d.amount || 0]));
            const filled = [];
            const cur = new Date(startDay);
            while (cur <= endDay) {
                const key = toYMD(cur);
                filled.push({ date: key, amount: salesMap.get(key) || 0 });
                cur.setDate(cur.getDate() + 1);
            }
            salesGraphFilled = filled;
        }

        /* ================= TABLES BY FLOOR ================= */
        const tablesByFloor = (tables || []).reduce((acc, t) => {
            const floor = t.floor || "Ground";
            if (!acc[floor]) acc[floor] = { total: 0, occupied: 0, available: 0 };
            acc[floor].total += 1;
            if (t.status === "occupied") acc[floor].occupied += 1;
            else acc[floor].available += 1;
            return acc;
        }, {});

        /* ================= FINAL RESPONSE ================= */
        res.json({
            range: {
                from: start,
                to: end
            },
            preset: preset || null,
            totalSales,
            totalOrders,
            ordersSummary: {
                paid: paidOrders,
                unpaid: unpaidOrders,
            },
            orderStatus: orderStatusNormalized,
            tablesSummary: {
                total: totalTables,
                occupied: occupiedTables,
                available: availableTables,
            },
            tablesByFloor,
            tables,
            staffOnDuty,
            menuSummary: {
                products: { total: totalProducts, active: activeProducts },
                categories: { total: totalCategories, active: activeCategories },
            },
            paymentSummary,

            salesGraph: salesGraphFilled,
            topItems,
            recentOrders: (recentOrders || []).map((o) => ({
                _id: o._id,
                createdAt: o.createdAt,
                table: o.tableId
                    ? {
                        _id: o.tableId._id,
                        tableNumber: o.tableId.tableNumber,
                        floor: o.tableId.floor,
                    }
                    : null,
                orderStatus: o.orderStatus,
                paymentStatus: o.paymentStatus,
                paymentMethod: o.paymentMethod || null,
                totalAmount: o.totalAmount,
                itemsCount: Array.isArray(o.items)
                    ? o.items.reduce((sum, it) => sum + (it.quantity || 0), 0)
                    : 0,
            }))
        });

    } catch (error) {
        console.error("Dashboard Overview Error:", error);
        res.status(500).json({ message: "Dashboard load failed" });
    }
};

module.exports = { dashboardOverview };
