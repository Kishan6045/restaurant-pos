const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware"); //const role = require("../middlewares/roleMIddleware");
const { createOrder } = require("../controllers/orderController");
const { getBillingByOrderId } = require("../controllers/billingController");



//  ORDER API (cashier + admin)
router.post(
  "/order",
  auth,
  permit("orders.create"), // role("cashier", "admin"),
  createOrder
);


//  BILLING API (cashier + admin)
router.get(
  "/billing/:orderId",
  auth,
  permit("billing.view"),
  getBillingByOrderId   
);


module.exports = router;