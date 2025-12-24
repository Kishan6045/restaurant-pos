const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  getDashboard,
  createUser,
  createProduct
} = require("../controllers/adminController");

// Dashboard
router.get(
  "/dashboard",
  auth,
  role("admin"),
  getDashboard
);

// Create User
router.post(
  "/create-user",
  auth,
  role("admin"),
  createUser
);

// Create Product
router.post(
  "/products",
  auth,
  role("admin"),
  createProduct
);

module.exports = router;
