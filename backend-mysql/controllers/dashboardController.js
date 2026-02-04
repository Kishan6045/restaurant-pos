const {
  Order,
  OrderItem,
  Payment,
  Table,
  User,
  Product,
  Category,
  sequelize
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");

/* ================= HELPERS ================= */
const toYMD = (date) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
};

const normalizeOrderStatus = (status) =>
  status === "closed" ? "completed" : status;

/* ================= DASHBOARD OVERVIEW ================= */
const dashboardOverview = async (req, res) => {
  try {
    const { from, to, preset } = req.query;

    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const endToday = new Date(new Date().setHours(23, 59, 59, 999));

    const presetDaysMap = { "7d": 7, "30": 30 };

    let start, end;

    if (preset === "today") {
      start = startOfToday;
      end = endToday;
    } else if (preset === "yesterday") {
      start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      end = new Date(endToday);
      end.setDate(end.getDate() - 1);
    } else if (preset && presetDaysMap[preset]) {
      start = new Date(startOfToday);
      start.setDate(start.getDate() - (presetDaysMap[preset] - 1));
      end = endToday;
    } else {
      start = from ? new Date(from) : startOfToday;
      end = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : endToday;
    }

    /* ================= PARALLEL QUERIES ================= */
    const [
      totalOrders,
      paidOrders,
      unpaidOrders,
      staffOnDuty,

      totalTables,
      occupiedTables,
      availableTables,
      tables,

      totalProducts,
      activeProducts,
      totalCategories,
      activeCategories,

      paymentsRaw,
      totalSalesRaw,
      orderStatusRaw,
      salesGraphRaw,
      topItemsRaw,
      recentOrders
    ] = await Promise.all([

      /* ORDERS */
      Order.count({ where: { createdAt: { [Op.between]: [start, end] } } }),

      Order.count({
        where: {
          paymentStatus: "paid",
          createdAt: { [Op.between]: [start, end] }
        }
      }),

      Order.count({
        where: {
          paymentStatus: "unpaid",
          createdAt: { [Op.between]: [start, end] }
        }
      }),

      /* STAFF */
      User.count({ where: { role: "cashier", isActive: true } }),

      /* TABLES */
      Table.count(),
      Table.count({ where: { status: "occupied" } }),
      Table.count({ where: { status: "available" } }),
      Table.findAll({
        attributes: ["tableNumber", "floor", "status"],
        order: [["floor", "ASC"], ["tableNumber", "ASC"]],
        raw: true
      }),

      /* PRODUCTS / CATEGORIES */
      Product.count(),
      Product.count({ where: { isActive: true } }),
      Category.count(),
      Category.count({ where: { isActive: true } }),

      /* PAYMENT SUMMARY */
      Payment.findAll({
        attributes: [
          "method",
          [fn("SUM", col("amount")), "total"]
        ],
        where: { paidAt: { [Op.between]: [start, end] } },
        group: ["method"],
        raw: true
      }),

      /* TOTAL SALES */
      Order.findAll({
        attributes: [[fn("SUM", col("totalAmount")), "total"]],
        where: {
          paymentStatus: "paid",
          createdAt: { [Op.between]: [start, end] }
        },
        raw: true
      }),

      /* ORDER STATUS */
      Order.findAll({
        attributes: [
          [
            literal(
              `CASE WHEN orderStatus = 'closed' THEN 'completed' ELSE orderStatus END`
            ),
            "status"
          ],
          [fn("COUNT", col("id")), "count"]
        ],
        where: { createdAt: { [Op.between]: [start, end] } },
        group: ["status"],
        raw: true
      }),

      /* SALES GRAPH */
      Order.findAll({
        attributes: [
          [fn("DATE", col("createdAt")), "day"],
          [fn("SUM", col("totalAmount")), "total"]
        ],
        where: {
          paymentStatus: "paid",
          createdAt: { [Op.between]: [start, end] }
        },
        group: ["day"],
        order: [["day", "ASC"]],
        raw: true
      }),

      /* TOP ITEMS */
      OrderItem.findAll({
        attributes: [
          "name",
          [fn("SUM", col("quantity")), "quantity"]
        ],
        include: [{
          model: Order,
          where: {
            paymentStatus: "paid",
            createdAt: { [Op.between]: [start, end] }
          },
          attributes: []
        }],
        group: ["name"],
        order: [[literal("quantity"), "DESC"]],
        limit: 3,
        raw: true
      }),

      /* RECENT ORDERS */
      Order.findAll({
        where: { createdAt: { [Op.between]: [start, end] } },
        order: [["createdAt", "DESC"]],
        limit: 12,
        include: [{
          model: Table,
          attributes: ["tableNumber", "floor"]
        }]
      })
    ]);

    /* ================= POST PROCESSING ================= */

    const totalSales = totalSalesRaw?.[0]?.total || 0;

    const paymentSummary = { cash: 0, upi: 0, card: 0 };
    paymentsRaw.forEach(p => {
      paymentSummary[p.method] = Number(p.total);
    });

    const ORDER_STATUSES = ["open", "billed", "completed"];
    const orderStatusMap = {};
    orderStatusRaw.forEach(s => {
      orderStatusMap[s.status] = Number(s.count);
    });

    const orderStatus = ORDER_STATUSES.map(s => ({
      _id: s,
      count: orderStatusMap[s] || 0
    }));

    const salesGraph = salesGraphRaw.map(d => ({
      date: d.day,
      amount: Number(d.total)
    }));

    /* TABLES BY FLOOR */
    const tablesByFloor = tables.reduce((acc, t) => {
      const floor = t.floor || "Ground";
      if (!acc[floor]) acc[floor] = { total: 0, occupied: 0, available: 0 };
      acc[floor].total++;
      t.status === "occupied" ? acc[floor].occupied++ : acc[floor].available++;
      return acc;
    }, {});

    /* ================= RESPONSE ================= */
    res.json({
      range: { from: start, to: end },
      preset: preset || null,
      totalSales,
      totalOrders,
      OrdersSummary: {
        paid: paidOrders,
        unpaid: unpaidOrders
      },
      orderStatus,
      tableSummary: {
        total: totalTables,
        occupied: occupiedTables,
        available: availableTables
      },
      tablesByFloor,
      tables,
      staffOnDuty,
      menuSummary: {
        Product: { total: totalProducts, active: activeProducts },
        categories: { total: totalCategories, active: activeCategories }
      },
      paymentSummary,
      salesGraph,
      topItems: topItemsRaw,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        createdAt: o.createdAt,
        table: o.Table
          ? { tableNumber: o.Table.tableNumber, floor: o.Table.floor }
          : null,
        orderStatus: normalizeOrderStatus(o.orderStatus),
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        totalAmount: o.totalAmount
      }))
    });

  } catch (error) {
    console.error("Dashboard Overview Error:", error);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

module.exports = { dashboardOverview };
