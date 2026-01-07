const Order = require("../models/Order-Model");

// // daliy report
// exports.dailyReport = async (req, res) => {
//     try {
//         const start = new Date();
//         start.setHours(0, 0, 0, 0);  // day start

//         const end = new Date();
//         end.setHours(23, 59, 59, 999); // day end 

//         const orders = await Order.find({
//             paymentStatus: "paid",
//             createdAt: { $gte: start, $lte: end }
//         });

//         let totalSales = 0;
//         let paymentSummary = {};

//         orders.forEach(order => {
//             totalSales += order.totalAmount;

//             const method = order.paymentMethod; // cash / upi / card
//             if (!paymentSummary[method]) {
//                 paymentSummary[method] = 0;
//             }
//             paymentSummary[method] += order.totalAmount;
//           });
//         res.json({
//             date: start.toDateString(),
//             totalOrders: orders.length,
//             totalSales,
//             payments: paymentSummary    
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Daily report failed" });
//     }
// };


// // monthly report
// exports.monthlyReport = async (req, res) => {
//     try {
//         const now = new Date();

//         const start = new Date(now.getFullYear(), now.getMonth(), 1);  // Month ka first day (1st date, 00:00 AM)
//         const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);  // Month ka last day (last date, 11:59:59 PM)

//         const orders = await Order.find({
//             paymentStatus: "paid",
//             createdAt: { $gte: start, $lte: end }
//         });

//         let totalSales = 0;
//         let paymentSummary = {};

//         orders.forEach(order => {
//          totalSales += order.totalAmount;

//         const method = order.paymentMethod; // cash / upi / card

//         if (!paymentSummary[method]) {
//             paymentSummary[method] = 0;
//         }
//         paymentSummary[method] += order.totalAmount;

//         });
//         res.json({
//             month: now.getMonth() + 1,
//             year: now.getFullYear(),
//             totalOrders: orders.length,
//             totalSales,
//             payments: paymentSummary

//         });
//     } catch (error) {
//         res.status(500).json({ message: "monthly report failed" });
//     }
// };



// overall report
exports.report = async (req, res) => {
  try {
    const { type, from, to } = req.query;

    let start, end;
    const now = new Date();

    // ===== DATE RANGE =====
    if (type === "daily") {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }
    else if (type === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    else if (type === "yearly") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    }
    else if (from && to) {
      start = new Date(from);
      start.setHours(0, 0, 0, 0);
      end = new Date(to);
      end.setHours(23, 59, 59, 999);
    }
    else {
      return res.status(400).json({ message: "Invalid report filter" });
    }

    // ===== FETCH ORDERS =====
    const orders = await Order.find({
      paymentStatus: "paid",
      createdAt: { $gte: start, $lte: end }
    });

    let totalSales = 0;
    let paymentSummary = {};
    let itemSummary = {};

    orders.forEach(order => {
      totalSales += order.totalAmount;

      // payment summary
      if (!paymentSummary[order.paymentMethod]) {
        paymentSummary[order.paymentMethod] = 0;
      }
      paymentSummary[order.paymentMethod] += order.totalAmount;

      // item wise (SAFE CHECK)
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!itemSummary[item.name]) {
            itemSummary[item.name] = { quantity: 0, amount: 0 };
          }
          itemSummary[item.name].quantity += item.quantity;
          itemSummary[item.name].amount += item.price * item.quantity;
        });
      }
    });

    res.json({
      from: start,
      to: end,
      totalOrders: orders.length,
      totalSales,
      payments: paymentSummary,
      items: itemSummary
    });

  } catch (error) {
    console.error("REPORT ERROR:", error);
    res.status(500).json({ message: "Report generation failed" });
  }
};
