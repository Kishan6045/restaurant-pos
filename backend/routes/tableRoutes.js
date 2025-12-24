const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { createTable } = require("../controllers/tableControllers");

// CREATE TABLE (ADMIN ONLY)
router.post("/",auth, role("admin"), createTable)

module.exports = router;
