const Order = require("../models/Order-Model");
const Table = require("../models/Table-Model");
const Product = require("../models/Products-Model");



// exports.createOrder = async (req, res) => {
//     try {
//         const { tableId, items } = req.body;

//         if (!items || items.length === 0) {
//             return res.status(400).json({ message: "Items required" });
//         }

//         const table = await Table.findById(tableId);
//         if (!table) {
//             return res.status(404).json({ message: "Table not found" });
//         }

//         //  check existing OPEN order
//         let order = await Order.findOne({
//             tableId,
//             orderStatus: "open"
//         });

//         let totalAmount = order ? order.totalAmount : 0;

//         //  order items array
//         const orderItems = [];
//         // loop through items
//         for (let item of items) {
//             if (!item.productId || !item.quantity || item.quantity <= 0) {
//                 return res.status(400).json({ message: "ProductId and quantity required" });
//             }
//             if (item.quantity <= 0) {
//                 return res.status(400).json({ message: "Quntity must be greater than 0" });
//             }

//             const product = await Product.findById(item.productId);
//             if (!product) {
//                 return res.status(404).json({ message: "Product not found" });
//             }

//             // total amount calculation
//             totalAmount += product.price * item.quantity;

//             // // order items prepare
//             // const orderItem = {
//             //     productId: product._id,
//             //     name: product.name,
//             //     price: product.price,
//             //     quantity: item.quantity,
//             //     status: "pending"
//             // };
//             const existingItem = order.items.find(
//                 i =>
//                     i.productId.toString() === item.productId.toString() &&
//                     i.status !== "ready"
//             );

//             if (existingItem) {
//                 // merge only if NOT ready
//                 existingItem.quantity += item.quantity;
//             } else {
//                 // 🔥 always create new pending item
//                 order.items.push({
//                     productId: product._id,
//                     name: product.name,
//                     price: product.price,
//                     quantity: item.quantity,
//                     status: "pending"
//                 });
//             }



//             //agar order already hai → item add
//             if (order) {
//                 const existingItem = order.items.find(
//                     i => i.productId.toString() === item.productId.toString()
//                 );

//                 if (existingItem) {
//                     existingItem.quantity += item.quantity;
//                 } else {

//                     order.items.push(orderItem);
//                 }
//             }
//             // ================= NEW ORDER =================
//             else {
//                 orderItems.push(orderItem);
//             }
//         }
//         if (isNaN(totalAmount)) {
//             return res.status(400).json({ message: "Invaild total amount calculation" });
//         }

//         // agar open order nahi mila → new create
//         if (!order) {
//             order = await Order.create({
//                 tableId,
//                 items: orderItems,
//                 totalAmount,
//                 orderStatus: "open",
//                 paymentStatus: "unpaid",
//                 createdBy: req.user.id
//             });
//             table.status = "occupied";
//             await table.save();

//             return res.status(201).json(order);
//         }

//         //existing order update
//         order.totalAmount = totalAmount;
//         await order.save();
//         res.json({ message: "Iteams added to existing order", order });
//     } catch (error) {
//         res.status(500).json({ message: "Order creation failed" });
//     }
// };





exports.createOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // find open order for this table
    let order = await Order.findOne({
      tableId,
      orderStatus: "open"
    });

    let totalAmount = order ? order.totalAmount : 0;
    const orderItems = [];

    for (let item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid item data" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      totalAmount += product.price * item.quantity;

      // 🔥 CASE 1: order already exists
      if (order) {
        const existingItem = order.items.find(
          i =>
            i.productId.toString() === item.productId.toString() &&
            i.status !== "ready"
        );

        if (existingItem) {
          // merge only if not READY
          existingItem.quantity += item.quantity;
        } else {
          // new KOT item
          order.items.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            status: "pending"
          });
        }
      }
      // 🔥 CASE 2: first order for this table
      else {
        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          status: "pending"
        });
      }
    }

    // 🔥 create new order if not exists
    if (!order) {
      order = await Order.create({
        tableId,
        items: orderItems,
        totalAmount,
        orderStatus: "open",
        paymentStatus: "unpaid",
        createdBy: req.user?.id || null
      });

      table.status = "occupied";
      await table.save();

      return res.status(201).json(order);
    }

    // 🔥 update existing order
    order.totalAmount = totalAmount;
    await order.save();

    res.json({ message: "Items added to existing order", order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order creation failed" });
  }
};




//Kitchen updates order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["pending", "preparing", "ready"]; // "served"
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invaild status" });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        "items._id": req.params.itemId
      },
      {
        $set: { "items.$.status": status }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    //  CHECK: all items of THIS table ready or not
    const allItemsReady = order.items.every(
      (item) => item.status === "ready"
    );

    //  FINAL RULE
    if (allItemsReady && order.paymentStatus === "paid") {
      order.orderStatus = "completed";
      await order.save();

      await Table.findByIdAndUpdate(order.tableId, {
        status: "available"
      });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: " Status update failed" });
  }
};


// View orders (Kitchen + Cashier + Admin)
exports.getOrders = async (req, res) => {
  try {
    let filter = {};
    // filter based on role

    if (req.user.role === "kitchen") {
      filter = {
        orderStatus: "open",
        "items.status": { $in: ["pending", "preparing"] }
      };
    }

    const orders = await Order.find(filter)
      .populate("tableId")    //populate use kare to pura table data aaja ta hai
      .populate("items.productId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};