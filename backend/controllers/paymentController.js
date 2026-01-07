const Payment = require("../models/Payment-Model");
const Order = require("../models/Order-Model");
const Table = require("../models/Table-Model");

exports.createPayment = async (req, res) => {
    try {
        //Order check
        const { orderId, method } = req.body;

        const order = await Order.findById(orderId);
        if (!order)
            return res.status(404).json({ message: "Order not found" });
        if (order.paymentStatus === "paid")
            return res.status(400).json({ message: "Order already paod" });

        //Create payment
        const payment = await Payment.create({
            orderId,
            amount: order.totalAmount,
            method,
            receivedBy: req.user.id
        });

        //Close order
        order.paymentStatus = "paid";
        order.paymentMethod = method;  // cash | upi | card
        order.orderStatus = "closed";
        await order.save();

        //table khali thai gyu che new customer aavi jai
        await Table.findByIdAndUpdate(order.tableId, {
            status: "available"
        });
        res.status(201).json({ message: "Payment successful", payment });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Payment failed"  });
    }
}


