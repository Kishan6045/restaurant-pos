const express = require("express");
const router = express.Router();

// IMPORT MIDDLEWARES
const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware"); // const role = require("../middlewares/roleMiddleware");
//IMPORT CONTROLLER
const { createOrder,
    updateOrderStatus,
    getOrders
} = require("../controllers/orderController");


//cashier||admin create order 
router.post(
    "/",
    auth,
    permit("orders.create"), // role("cashier", "admin"),
    createOrder
);


// Kitchen updates status
router.patch(
    "/:orderId/items/:itemId",
    auth,
    permit("kitchen.update"),  // role("kitchen", "admin"),
    updateOrderStatus
);


//View orders
router.get(
    "/",
    auth,
    permit("orders.read"),  // role("kitchen", "cashier", "admin"),
    getOrders
);


module.exports = router;