const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true,
        trim: true   // agal pachl ni vadharani space remove
    },
    isActive: {     // isactive se product ko no?off kar sakte hai
        type: Boolean,
        default: true
    }
}, {timestamps: true});

module.exports = mongoose.model("Category", categorySchema);