const Order = require("../models/Order-Model");
const Payment = require("../models/Payment-Model");
const Table = require("../models/Table-Model");
const User = require("../models/User-Model");

// URL: GET /api/admin/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
//Permission: dashboard.read
const dashboardOverview = async (req, res) => {
    try {
        const { from, to } = req.query;

        const start = from
            ? new Date(from)
            : new Date(new Date().setHours(0, 0, 0, 0));

        const end = to
            ? new Date(new Date(to).setHours(23, 59, 59, 999))
            : new Date(new Date().setHours(23, 59, 59, 999));

        /* ================= ORDERS ================= */
        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end }
        });
        const totalOrders = orders.length;

        const completedOrders = orders.filter(o => o.status === "completed");

        const totalSales = completedOrders.reduce(
            (sum, o) => sum + (o.totalAmount || 0),
            0
        );


        // order status :  dekhata hai
        const orderStatus = await Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: "$status",
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
            { $match: { createdAt: { $gte: start, $lte: end } } },
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
                    status: "completed",
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

        /* ================= FINAL RESPONSE ================= */
        res.json({
            range: {
                from: start,
                to: end
            },
            totalSales,
            totalOrders,
            orderStatus,
            activeTables: {
                occupied: occupiedTables,
                total: totalTables
            },
            staffOnDuty,
            paymentSummary,

            salesGraph
        });

    } catch (error) {
        console.error("Dashboard Overview Error:", error);
        res.status(500).json({ message: "Dashboard load failed" });
    }
};

module.exports = { dashboardOverview };
