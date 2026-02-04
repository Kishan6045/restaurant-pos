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
    const dd = String(d.getDate()).padStart(2, 0);
    return `${yyyy}-${mm}-${dd}`;
}
const normalizeOrderStatus = (status) =>
    status === "closed" ? "completed" : status;
// URL: GET /api/admin/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
//Permission: dashboard.read
const dashboardOverview = async (req, res) => {
    try {
        const { from, to, preset } = req.query;

        const now = new Date();
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        const endToday = new Date(new Date().setHours(23, 59, 59, 999));

        //preset Supported
        const presetDaysMap = {
            "7d": 7,
            "30": 30,
        };

        let start;
        let end;

        if (preset === "today") {
            start = startOfToday;
            end = endToday
        }
        else if (preset === "yesterday") {
            start = new Date(startOfToday);
            start.setDate(start.getDate() - 1);   // -1 matlab 1day piche le ja na hai
            end = new Date(endToday);
            end.setDate(end.getDate() - 1);
        }
        else if (preset && presetDaysMap[preset]) {
            const days = presetDaysMap[preset];
            start = new Date(startOfToday);
            start.setDate(start.getDate() - (days - 1));
            end = endToday;
        }
        else {
            // custom range
            start = from
                ? new Date(from)
                : startOfToday;
            end = to
                ? new Date(new Date(to).setHours(23, 59, 59, 999))
                : endToday;
        }


        /* ================= All summary ================= */
        /*
         Promise.all() runs all DB queries in parallel
         This is MUCH faster than running them one-by-one
         */
        const [
            totalOrders,          // Total orders in date range
            paidOrders,           // Orders with paymentStatus = "paid"
            unpaidOrders,         // Orders with paymentStatus = "unpaid"
            staffOnDuty,          // Active cashiers count
            totalTables,          // Total tables in restaurant
            occupiedTables,       // Tables currently occupied
            availableTables,      // Tables currently available
            tables,               // Table list (number, floor, status)
            totalProducts,        // Total products
            activeProducts,       // Active products
            totalCategories,      // Total categories
            activeCategories,     // Active categories
            payments,             // Payment summary by method
            totalSalesAgg,        // Aggregated total sales
            orderStatusRaw,       // Orders grouped by status
            salesGraphRaw,        // Daily sales data
            topItems,             // Top selling items
            recentOrders,         // Recent orders list
        ] = await Promise.all([
            /* ================= ORDER COUNTS ================= */

            // Count all orders within selected date range
            Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),

            // Count only PAID orders
            Order.countDocuments({
                paymentStatus: "paid",
                createdAt: { $gte: start, $lte: end }
            }),

            // Count only UNPAID orders
            Order.countDocuments({
                paymentStatus: "unpaid",
                createdAt: { $gte: start, $lte: end }
            }),


            /* ================= STAFF ================= */
            // Count active cashier staff
            User.countDocuments({ role: "cashier", isActive: true }),


            /* ================= TABLES ================= */

            // Total tables
            Table.countDocuments(),

            // Occupied tables
            Table.countDocuments({ status: "occupied" }),

            // Available tables
            Table.countDocuments({ status: "available" }),

            // Fetch table list sorted by floor & table number
            Table.find({}, "tableNumber floor status")
                .sort({ floor: 1, tableNumber: 1 })
                .lean(),

            /* ================= PRODUCTS & CATEGORIES ================= */
            // Total products
            Product.countDocuments(),

            // Active products only
            Product.countDocuments({ isActive: true }),

            // Total categories
            Category.countDocuments(),

            // Active categories only
            Category.countDocuments({ isActive: true }),

            /* ================= PAYMENT SUMMARY ================= */

            // Group payments by payment method (cash / upi / card)
            Payment.aggregate([
                { $match: { paidAt: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: "$method",            // payment method
                        total: { $sum: "$amount" } // total amount per method
                    }
                }
            ]),


            /* ================= TOTAL SALES ================= */
            // Calculate total sales from PAID orders
            Order.aggregate([
                {
                    $match: {
                        paymentStatus: "paid",
                        createdAt: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]),

            /* ================= ORDER STATUS COUNTS ================= */

            // Group orders by status (open / billed // completed)
            Order.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                {
                    $addFields: {
                        normalizedStatus: {
                            $cond: [
                                { $eq: ["$orderStatus", "closed"] },
                                "completed",
                                "$orderStatus"
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$normalizedStatus",
                        count: { $sum: 1 }
                    }
                }
            ]),


            /* ================= SALES GRAPH ================= */

            // Daily sales graph (date wise total)
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
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt"
                                }
                            }
                        },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id.day": 1 } }
            ]),

            /* ================= TOP SELLING ITEMS ================= */

            // Find most sold items
            Order.aggregate([
                { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
                { $unwind: "$items" }, // Break items array
                {
                    $group: {
                        _id: "$items.name",
                        quantity: { $sum: "$items.quantity" }
                    }
                },
                { $sort: { quantity: -1 } },
                { $limit: 3 }
            ]),

            /* ================= RECENT ORDERS ================= */

            // Latest 12 orders
            Order.find({ createdAt: { $gte: start, $lte: end } })
                .sort({ createdAt: -1 })
                .limit(12)
                .select("createdAt tableId orderStatus paymentStatus paymentMethod totalAmount items")
                .populate("tableId", "tableNumber floor")
                .lean(),
        ]);

        /* ================= POST PROCESSING ================= */

        // Safely extract total sales value
        const totalSales = totalSalesAgg?.[0]?.total || 0;

        // Default payment summary structure
        const paymentSummary = { cash: 0, upi: 0, card: 0 };

        // Fill payment summary from aggregation result
        (payments || []).forEach(p => {
            if (p && p._id) {
                paymentSummary[p._id] = p.total;
            }
        });



        /* ================= ORDER STATUS NORMALIZATION ================= */

        // Ensure UI always receives all statuses
        const ORDER_STATUSES = ["open", "billed", "completed"];
        const orderStatusMap = {};

        // Convert aggregation array to map
        (orderStatusRaw || []).forEach(s => {
            if (s && s._id) {
                orderStatusMap[s._id] = s.count || 0;
            }
        });

        // Create normalized array (no missing statuses)
        const orderStatusNormalized = ORDER_STATUSES.map(s => ({
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
            OrdersSummary: {
                paid: paidOrders,
                unpaid: unpaidOrders,
            },
            orderStatus: orderStatusNormalized,
            tableSummary: {
                total: totalTables,
                occupied: occupiedTables,
                available: availableTables,
            },
            tablesByFloor,
            tables,
            staffOnDuty,
            menuSummary: {
                Product: { total: totalProducts, active: activeProducts },
                categories: { total: totalCategories, active: activeCategories },
            },
            paymentSummary,

            salesGraph: salesGraphFilled,
            topItems,
            recentOrders: (recentOrders || []).map(o => ({
                _id: o._id,
                createdAt: o.createdAt,
                table: o.tableId
                    ? {
                        _id: o.tableId._id,
                        tableNumber: o.tableId.tableNumber,
                        floor: o.tableId.floor,
                    }
                    : null,
                orderStatus: normalizeOrderStatus(o.orderStatus),
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
