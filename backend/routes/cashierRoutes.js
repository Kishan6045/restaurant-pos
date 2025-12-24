const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMIddleware");


// ✅ ORDER API (cashier + admin)
router.post(
  "/order",
  auth,
  role("cashier", "admin"),
  (req, res) => {
    res.json({ message: "Order Created" });
  }
);


// ✅ BILLING API (cashier + admin)
router.get(
  "/billing",
  auth,
  role("cashier", "admin"),
  (req, res) => {
    res.json({ message: "Billing Screen" });
  }
);

module.exports = router;