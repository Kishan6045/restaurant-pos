const Order = require("../models/Order-Model");
const Payment = require("../models/Payment-Model");
const Table = require("../models/Table-Model");
const User = require("../models/User-Model");

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

        if (preset === "this_month") {
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

        /* ================= ORDERS ================= */
        const totalOrders = await Order.countDocuments({
            createdAt: { $gte: start, $lte: end }
        });

        // Treat "sales" as paid orders total (matches actual revenue best).
        const totalSalesAgg = await Order.aggregate([
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
        ]);
        const totalSales = totalSalesAgg?.[0]?.total || 0;


        // order status :  dekhata hai
        const orderStatus = await Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Table status --------------------------------------------------
        const totalTables = await Table.countDocuments();
        const occupiedTables = await Table.countDocuments({ status: "occupied" });

        // STAFF ON DUTY (Only Cashier )   ----------------------------
        const staffOnDuty = await User.countDocuments({
            role: "cashier",
            isActive: true
        });


        // payment total -------------------------------------------
        const payments = await Payment.aggregate([
            { $match: { paidAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: "$method", // cash | upi | card
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        const paymentSummary = { cash: 0, upi: 0, card: 0 };
        payments.forEach(p => {            // loop se csah upi sab ka total kar raha hai
            paymentSummary[p._id] = p.total;
        });




        /* ================= SALES GRAPH (RANGE BASED) ================= */
        const salesGraphRaw = await Order.aggregate([
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
        ]);

        const salesGraph = salesGraphRaw.map(d => ({
            date: d._id.day,
            amount: d.total
        }));

        /* ================= TOP ITEMS ================= */
        const topItems = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    createdAt: { $gte: start, $lte: end }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    quantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 8 }
        ]);

        /* ================= FINAL RESPONSE ================= */
        res.json({
            range: {
                from: start,
                to: end
            },
            preset: preset || null,
            totalSales,
            totalOrders,
            orderStatus,
            activeTables: {
                occupied: occupiedTables,
                total: totalTables
            },
            staffOnDuty,
            paymentSummary,

            salesGraph,
            topItems
        });

    } catch (error) {
        console.error("Dashboard Overview Error:", error);
        res.status(500).json({ message: "Dashboard load failed" });
    }
};

module.exports = { dashboardOverview };
