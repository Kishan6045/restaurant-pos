const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { report } = require("../controllers/reportController");

router.get("/", auth, role("admin"), report);


module.exports = router; 