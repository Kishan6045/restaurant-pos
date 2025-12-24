const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { createProduct } = require("../controllers/productController");

router.post("/", auth, role("admin"), createProduct);

module.exports = router;
