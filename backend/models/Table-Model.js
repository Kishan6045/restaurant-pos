const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
  },
  floor: {
  type: String,
  default: "Ground"
}
  ,
  status: {
    type: String,
    enum: ["available", "occupied"],
    default: "available"
  }
}, { timestamps: true });

// ground foloe me tavble 1 hai to unique hona chahiye
tableSchema.index(
  { tableNumber: 1, floor: 1 },
  { unique: true }
);

module.exports = mongoose.model("Table", tableSchema);
