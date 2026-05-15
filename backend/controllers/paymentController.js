const Payment = require("../models/Payment-Model");
const Order = require("../models/Order-Model");
const Table = require("../models/Table-Model");

const PAYMENT_METHODS = ["cash", "upi", "card"];

exports.createPayment = async (req, res) => {
    try {
        //Order check
        const { orderId, method } = req.body;

        if (!method || !PAYMENT_METHODS.includes(method)) {
            return res.status(400).json({ message: "Valid payment method required (cash, upi, card)" });
        }

        if (!orderId) {
            return res.status(400).json({ message: "Order id required" });
        }

        const order = await Order.findById(orderId);
        if (!order)
            return res.status(404).json({ message: "Order not found" });
        if (order.paymentStatus === "paid")
            return res.status(400).json({ message: "Order already paid" });

        if (order.orderStatus !== "open") {
            return res.status(400).json({
                message: "Only open orders can be paid. This bill is already closed or completed.",
            });
        }

        const lines = order.items || [];
        if (lines.length === 0) {
            return res.status(400).json({ message: "Order has no line items" });
        }

        const kitchenDone = new Set(["ready", "served"]);
        const allKitchenDone = lines.every((item) => kitchenDone.has(item.status));

        if (!allKitchenDone) {
            return res.status(400).json({
                message:
                    "Payment is only allowed after kitchen marks every item as Ready. Please wait for the kitchen display or refresh billing.",
            });
        }

        const payment = await Payment.create({
            orderId,
            amount: order.totalAmount,
            method,
            receivedBy: req.user.id
        });

        order.paymentStatus = "paid";
        order.paymentMethod = method;
        order.orderStatus = "completed";

        await Table.findByIdAndUpdate(order.tableId, {
            status: "available"
        });

        await order.save();


        res.status(201).json({ message: "Payment successful", payment });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Payment failed" });
    }
}


