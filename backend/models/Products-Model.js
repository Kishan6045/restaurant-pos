const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true    // Kitchen / Stock control
  },
  isActive: {
    type: Boolean,
    default: true   // Admin control
  }
}, { timestamps: true });

productsSchema.index(  // unique combination of name and category
  { name: 1, category: 1 },
  { unique: true }
);


module.exports = mongoose.model("Product", productsSchema);
