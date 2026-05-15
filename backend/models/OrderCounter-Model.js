const mongoose = require("mongoose");

/** One doc per UTC calendar day (`_id` = `YYYY-MM-DD`), `seq` = last issued order # that day. */
const orderCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { collection: "ordercounters" }
);

module.exports = mongoose.model("OrderCounter", orderCounterSchema);
