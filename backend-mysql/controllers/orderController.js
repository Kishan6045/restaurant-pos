const {
  Order,
  OrderItem,
  Table,
  Product,
  sequelize
} = require("../models");
const { Op } = require("sequelize");

/* ================= CREATE ORDER ================= */
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tableId, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    const table = await Table.findByPk(tableId, { transaction: t });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // find open order for table
    let order = await Order.findOne({
      where: { tableId, orderStatus: "open" },
      include: [OrderItem],
      transaction: t
    });

    let totalAmount = order ? order.totalAmount : 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid item data" });
      }

      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      totalAmount += product.price * item.quantity;

      if (order) {
        // check existing non-ready item
        const existingItem = order.OrderItems.find(
          i => i.productId === item.productId && i.status !== "ready"
        );

        if (existingItem) {
          await existingItem.update(
            { quantity: existingItem.quantity + item.quantity },
            { transaction: t }
          );
        } else {
          await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            status: "pending"
          }, { transaction: t });
        }
      } else {
        // first order
        if (!order) {
          order = await Order.create({
            tableId,
            totalAmount: 0,
            orderStatus: "open",
            paymentStatus: "unpaid",
            createdBy: req.user?.id || null
          }, { transaction: t });
        }

        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          status: "pending"
        }, { transaction: t });
      }
    }

    await order.update({ totalAmount }, { transaction: t });

    // mark table occupied
    if (table.status !== "occupied") {
      await table.update({ status: "occupied" }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: "Order created/updated",
      orderId: order.id
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

/* ================= KITCHEN UPDATE ITEM STATUS ================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId, itemId } = req.params;

    const allowedStatus = ["pending", "preparing", "ready"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const item = await OrderItem.findOne({
      where: { id: itemId, orderId }
    });

    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }

    await item.update({ status });

    const orderItems = await OrderItem.findAll({
      where: { orderId }
    });

    const order = await Order.findByPk(orderId);

    const allItemsReady = orderItems.every(i => i.status === "ready");

    if (allItemsReady && order.paymentStatus === "paid") {
      await order.update({ orderStatus: "completed" });

      await Table.update(
        { status: "available" },
        { where: { id: order.tableId } }
      );
    }

    res.json({ message: "Order item status updated" });

  } catch (error) {
    res.status(500).json({ message: "Status update failed" });
  }
};

/* ================= GET ORDERS ================= */
exports.getOrders = async (req, res) => {
  try {
    let where = {};
    let itemWhere = {};

    // kitchen sees only pending/preparing
    if (req.user.role === "kitchen") {
      itemWhere.status = { [Op.in]: ["pending", "preparing"] };
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: Table },
        {
          model: OrderItem,
          where: itemWhere,
          required: req.user.role === "kitchen"
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
