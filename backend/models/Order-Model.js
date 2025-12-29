const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: true
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            name: String,
            price: Number,
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],

    status: {
        type: String,
        enum: ["pending", "preparing", "ready", "served"],
        default: "pending"
    },

    totalAmount: {
        type: Number,
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid"
    },
     paymentMethod: {                
    type: String,
    enum: ["cash", "upi", "card"]
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);