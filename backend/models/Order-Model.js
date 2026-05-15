const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: true
    },

    /** UTC date key `YYYY-MM-DD` — matches OrderCounter._id for that day’s sequence */
    businessDay: {
        type: String,
        trim: true,
    },

    /** Human kitchen / ticket number for this day, e.g. `#104` (unique per `businessDay`) */
    displayOrderNumber: {
        type: Number,
        min: 1,
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
            },
            //kitchenStatus
            status:{
                type: String,
                enum: ["pending", "preparing", "ready","served"],
                default: "pending"
            }
        }
    ],

    // overall order status
    orderStatus: {
        type: String,
        enum: ["open", "billed","completed", "closed"],
        default: "open"
    },

    totalAmount:{
        type: Number,
        required: true
    },
    // billing  and payment details
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