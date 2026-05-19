const Order = require("../models/Order-Model");

/** Next running order number for a table (increments after each completed order). */
async function getNextTableOrderNumber(tableId) {
  const lastWithSeq = await Order.findOne(
    { tableId, orderStatus: "completed", tableOrderNumber: { $gte: 1 } },
    { tableOrderNumber: 1 }
  )
    .sort({ tableOrderNumber: -1 })
    .lean();

  if (lastWithSeq?.tableOrderNumber != null) {
    return lastWithSeq.tableOrderNumber + 1;
  }

  const completedCount = await Order.countDocuments({
    tableId,
    orderStatus: "completed",
  });
  return completedCount + 1;
}

module.exports = { getNextTableOrderNumber };
