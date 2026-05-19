const Order = require("../models/Order-Model");

exports.getBillingByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      paymentStatus: "paid",
    })
      .populate("tableId")
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({
        message: "Paid bill not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load paid bill",
    });
  }
};
