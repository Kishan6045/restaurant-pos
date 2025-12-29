const express = require("express");
const router = express.Router();

// IMPORT MIDDLEWARES
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

//IMPORT CONTROLLER
const { createOrder,
    updateOrderStatus,
    getOrders
} = require("../controllers/orderController");


//cashier||admin create order 
router.post(
    "/",
    auth,
    role("cashier", "admin"),
    createOrder
);


// Kitchen updates status
router.patch(
    "/:id",
    auth,
    role("kitchen", "admin"),
    updateOrderStatus
);


//View orders
router.get(
    "/",
    auth,
    role("kitchen", "cashier", "admin"),
    getOrders
);


module.exports = router;