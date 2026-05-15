const Order = require("../models/Order-Model");
const OrderCounter = require("../models/OrderCounter-Model");
const Table = require("../models/Table-Model");
const Product = require("../models/Products-Model");
const { businessDayKey } = require("../utils/businessDay");




// Create Order
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

      //  CASE 1: order already exists
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
      // CASE 2: first order for this table
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

    // create new order if not exists
    if (!order) {
      const businessDay = businessDayKey();
      const counter = await OrderCounter.findByIdAndUpdate(
        businessDay,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const displayOrderNumber = counter.seq;

      order = await Order.create({
        tableId,
        businessDay,
        displayOrderNumber,
        items: orderItems,
        totalAmount,
        orderStatus: "open",
        paymentStatus: "unpaid",
      });

      table.status = "occupied";
      await table.save();

      return res.status(201).json(order);
    }

    // update existing order
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

    const { tableId } = req.query;
    if (tableId) {
      filter.tableId = tableId;
    }

    if (req.user.role === "kitchen") {
      filter["items.status"] = { $in: ["pending", "preparing"] };
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