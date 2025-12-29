const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
    dailyReport,
    monthlyReport
} = require("../controllers/reportController");

router.get(
           "/daily",
            auth,
            role("admin"),
            dailyReport
        );

router.get(
           "/monthly",
           auth,
           role("admin"),
           monthlyReport
);


module.exports = router; 