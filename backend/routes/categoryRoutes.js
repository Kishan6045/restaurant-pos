const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { createCategory } = require("../controllers/categoryController");

// CREATE CATEGORY (ADMIN ONLY)
router.post("/", auth, role("admin"), createCategory);



module.exports = router;