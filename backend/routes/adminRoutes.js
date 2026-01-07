const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
// const role = require("../middlewares/roleMiddleware");
const permit = require("../middlewares/permissionMiddleware");


const {
  getDashboard,
  createUser,
  createProduct
} = require("../controllers/adminController");

// Dashboard
router.get(
  "/dashboard",
  auth,
  permit("dashboard.read"),    // role("admin"),
  getDashboard
);

// Create User
router.post(
  "/create-user",
  auth,
  permit("staff.create"),      // role("admin"),
  createUser
);

// Create Product
router.post(
  "/products",
  auth,
  permit("products.create"),  // role("admin"),
  createProduct
);

module.exports = router;
