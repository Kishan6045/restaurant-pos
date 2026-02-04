const { Order, OrderItem, sequelize } = require("../models");
const { Op, fn, col } = require("sequelize");

// overall report
exports.report = async (req, res) => {
  try {
    const { type, from, to } = req.query;

    let start, end;
    const now = new Date();

    /* ===== DATE RANGE ===== */
    if (type === "daily") {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (type === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (type === "yearly") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (from && to) {
      start = new Date(from);
      start.setHours(0, 0, 0, 0);
      end = new Date(to);
      end.setHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({ message: "Invalid report filter" });
    }

    /* ===== FETCH PAID ORDERS ===== */
    const orders = await Order.findAll({
      where: {
        paymentStatus: "paid",
        createdAt: { [Op.between]: [start, end] }
      },
      attributes: ["id", "totalAmount", "paymentMethod"]
    });

    const totalOrders = orders.length;

    /* ===== TOTAL SALES ===== */
    const totalSales = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0
    );

    /* ===== PAYMENT SUMMARY ===== */
    const paymentRows = await Order.findAll({
      attributes: [
        "paymentMethod",
        [fn("SUM", col("totalAmount")), "amount"]
      ],
      where: {
        paymentStatus: "paid",
        createdAt: { [Op.between]: [start, end] }
      },
      group: ["paymentMethod"],
      raw: true
    });

    const paymentSummary = {};
    paymentRows.forEach(p => {
      paymentSummary[p.paymentMethod] = Number(p.amount);
    });

    /* ===== ITEM WISE SUMMARY ===== */
    const itemRows = await OrderItem.findAll({
      attributes: [
        "name",
        [fn("SUM", col("quantity")), "quantity"],
        [fn("SUM", sequelize.literal("price * quantity")), "amount"]
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: {
            paymentStatus: "paid",
            createdAt: { [Op.between]: [start, end] }
          }
        }
      ],
      group: ["name"],
      raw: true
    });

    const itemSummary = {};
    itemRows.forEach(i => {
      itemSummary[i.name] = {
        quantity: Number(i.quantity),
        amount: Number(i.amount)
      };
    });

    /* ===== RESPONSE ===== */
    res.json({
      from: start,
      to: end,
      totalOrders,
      totalSales,
      payments: paymentSummary,
      items: itemSummary
    });

  } catch (error) {
    console.error("REPORT ERROR:", error);
    res.status(500).json({ message: "Report generation failed" });
  }
};
