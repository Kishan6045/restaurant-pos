const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    amount: {
        type: Number,
        required:true
    },
    method: {
        type: String,
        enum: ["cash", "upi", "card"],
        required: true
    },
    paidAt: {
        type: Date,
        default: Date.now
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Payment", paymentSchema);