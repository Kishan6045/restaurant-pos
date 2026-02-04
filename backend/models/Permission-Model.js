const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["admin", "cashier", "kitchen"],
        required: true,
        unique: true,
    },
    permissions: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model("Permission", permissionSchema);    