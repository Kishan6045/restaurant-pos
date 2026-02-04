const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["admin", "cashier", "kitchen"],    //enum  --> fix value mathi choice karvanu
        default: "cashier"
    },
    isActive: {
        type: Boolean,
        default: true,   //by default ACTIVE
    },
}, { timestamps: true }   //data record kab bana oe kab update huaa vo filed add kar ta hai
)


module.exports = mongoose.model("User", userSchema);
