const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware");  // const role = require("../middlewares/roleMiddleware");
const {
  getOrders,
  updateOrderStatus
} = require("../controllers/orderController");

// Kitchen dashboard
router.get(
  "/orders",
  auth,
  permit("kitchen.view", "orders.read"), //role("kitchen"),
  getOrders
);

// Update item status
router.patch(
  "/orders/:orderId/items/:itemId",
  auth,
  permit("kitchen.update"),  // role("kitchen"),
  updateOrderStatus
);

module.exports = router;
