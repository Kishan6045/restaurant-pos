const { Order, OrderItem, Product } = require("../models");

exports.getBillingByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: {
        id: orderId,
        paymentStatus: "paid"
      },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name"]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        message: "Paid bill not found"
      });
    }

    res.json({
      orderId: order.id,

      items: order.OrderItems.map(i => ({
        itemId: i.id,
        name: i.name || i.Product?.name,
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
