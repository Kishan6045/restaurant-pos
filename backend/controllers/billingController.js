const Order = require("../models/Order-Model");

exports.getBillingByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      paymentStatus: "paid"  
    }).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        message: "Paid bill not found"
      });
    }

    res.json({
      orderId: order._id,

      items: order.items.map(i => ({
        itemId: i._id,
        name: i.name,
        qty: i.quantity,
        price: i.price,
        subtotal: i.quantity * i.price,
        status: i.status
      })),

      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load paid bill"
    });
  }
};
