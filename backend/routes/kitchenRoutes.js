const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");


router.get(
  "/orders",
  auth,
  role("kitchen","admin"),
  (req, res) => {
    res.json({ message: "Kitchen Orders" });
  }
);

module.exports = router;