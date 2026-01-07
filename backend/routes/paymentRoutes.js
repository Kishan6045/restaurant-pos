const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware");  // const role = require("../middlewares/roleMiddleware");

const {
    createPayment
} = require("../controllers/paymentController");

router.post(
    "/",
    auth,
     permit("payments.create"),  // role("cashier", "admin"),
    createPayment
);

module.exports = router;
