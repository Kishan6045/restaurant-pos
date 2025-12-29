const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
    createPayment
} = require("../controllers/paymentController");

router.post(
    "/",
    auth,
    role("cashier", "admin"),
    createPayment
);

module.exports = router;
