const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware");


const { createUser } = require("../controllers/adminController");
const { dashboardOverview } = require("../controllers/dashboardController");


//  DASHBOARD
router.get(
  "/overview",
  auth,
  permit("dashboard.read"),
  dashboardOverview
);

// Create User
router.post(
  "/create-user",
  auth,
  permit("staff.create"),      // role("admin"),
  createUser
);



module.exports = router;
