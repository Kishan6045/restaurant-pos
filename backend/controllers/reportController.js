const Order = require("../models/Order-Model");

// daliy report
exports.dailyReport = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);  // day start

        const end = new Date();
        end.setHours(23, 59, 59, 999); // day end 

        const orders = await Order.find({
            paymentStatus: "paid",
            createdAt: { $gte: start, $lte: end }
        });

        let totalSales = 0;
        let paymentSummary = {};

        orders.forEach(order => {
            totalSales += order.totalAmount;

            const method = order.paymentMethod; // cash / upi / card
            if (!paymentSummary[method]) {
                paymentSummary[method] = 0;
            }
            paymentSummary[method] += order.totalAmount;

        });
        res.json({
            date: start.toDateString(),
            totalOrders: orders.length,
            totalSales,
            cash,
            online
        });
    } catch (error) {
        res.status(500).json({ message: "Daily report failed" });
    }
};


// monthly report
exports.monthlyReport = async (req, res) => {
    try {
        const now = new Date();

        const start = new Date(now.getFullYear(), now.getMonth(), 1);  // Month ka first day (1st date, 00:00 AM)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);  // Month ka last day (last date, 11:59:59 PM)

        const orders = await Order.find({
            paymentStatus: "paid",
            createdAt: { $gte: start, $lte: end }
        });

        let totalSales = 0;
        let paymentSummary = {};

        orders.forEach(order => {
         totalSales += order.totalAmount;

        const method = order.paymentMethod; // cash / upi / card

        if (!paymentSummary[method]) {
            paymentSummary[method] = 0;
        }
        paymentSummary[method] += order.totalAmount;

        });
        res.json({
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            totalOrders: orders.length,
            totalSales,
            payments: paymentSummary

        });
    } catch (error) {
        res.status(500).json({ message: "monthly report failed" });
    }
};