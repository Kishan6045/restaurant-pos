const {
  Payment,
  Order,
  OrderItem,
  Table,
  sequelize
} = require("../models");

/* ================= CREATE PAYMENT ================= */
exports.createPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId, method } = req.body;

    // 1️⃣ Order check
    const order = await Order.findByPk(orderId, {
      include: [OrderItem],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      await t.rollback();
      return res.status(400).json({ message: "Order already paid" });
    }

    // 2️⃣ Create payment
    const payment = await Payment.create({
      orderId: order.id,
      amount: order.totalAmount,
      method,
      receivedBy: req.user.id
    }, { transaction: t });

    // 3️⃣ Update order payment info
    let newOrderStatus = "billed";

    const allItemsReady = order.OrderItems.every(
      (item) => item.status === "ready"
    );

    if (allItemsReady) {
      newOrderStatus = "completed";

      // free table if everything ready
      await Table.update(
        { status: "available" },
        { where: { id: order.tableId }, transaction: t }
      );
    }

    await order.update({
      paymentStatus: "paid",
      paymentMethod: method,
      orderStatus: newOrderStatus
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Payment successful",
      payment
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: "Payment failed" });
  }
};
