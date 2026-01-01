const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { getOrders, updateOrderStatus } = require("../controllers/orderController");

// Kitchen dashboard
router.get(
  "/orders",
  auth,
  role("kitchen"),
  getOrders
);

// Update item status
router.patch(
  "/orders/:orderId/items/:itemId",
  auth,
  role("kitchen"),
  updateOrderStatus
);

module.exports = router;
