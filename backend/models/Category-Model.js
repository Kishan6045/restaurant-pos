const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true   // agal pachl ni vadharani space remove
    },
     cuisine: {
        type: String,
        enum: ["Gujarati", "Punjabi", "Chinese", "Common"],
        required: true
    },

    
    isActive: {     // isactive se product ko no?off kar sakte hai
        type: Boolean,
        default: true
    }
}, {timestamps: true});

categorySchema.index(    // unique combination of name and cuisine
  { name: 1, cuisine: 1 },
  { unique: true }
);

module.exports = mongoose.model("Category", categorySchema);