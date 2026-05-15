/**
 * One-time style fix: orders created before `displayOrderNumber` existed get
 * IST `businessDay` + daily sequence from `createdAt` order (chronological).
 */
const Order = require("../models/Order-Model");
const OrderCounter = require("../models/OrderCounter-Model");
const { businessDayKey } = require("../utils/businessDay");

async function assignMissingOrderNumbers() {
  const missing = await Order.find({
    $or: [{ displayOrderNumber: { $exists: false } }, { displayOrderNumber: null }],
  })
    .sort({ createdAt: 1 })
    .select("_id createdAt")
    .lean();

  let updated = 0;
  for (const o of missing) {
    const day = businessDayKey(new Date(o.createdAt));
    const counter = await OrderCounter.findByIdAndUpdate(
      day,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    await Order.updateOne(
      { _id: o._id },
      { $set: { businessDay: day, displayOrderNumber: counter.seq } }
    );
    updated += 1;
  }
  return updated;
}

module.exports = assignMissingOrderNumbers;
