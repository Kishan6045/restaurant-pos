const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware");  // const role = require("../middlewares/roleMiddleware");

const { 
  createCategory,
  getCategories,
  getCategoryProducts,
  updateCategory,
  deleteCategory

} = require("../controllers/categoryController");


// GET ALL CATEGORIES
router.get(
  "/",
  auth,
  permit("categories.read"), // role("admin", "cashier", "kitchen"),
  getCategories
);


// VIEW PRODUCTS UNDER CATEGORY
router.get(
  "/:id/products",
  auth,
  permit("categories.read"), // role("admin", "cashier", "kitchen"),
  getCategoryProducts
);

// CREATE CATEGORY
router.post(
  "/",
  auth,
  permit("categories.create"), // role("admin"),
  createCategory
);


// UPDATE CATEGORY
router.put(
  "/:id",
  auth,
  permit("categories.update"), //  role("admin"), 
  updateCategory
);


// DELETE CATEGORY
router.delete(
  "/:id",
  auth,
  permit("categories.delete"), // role("admin"),
  deleteCategory
);




module.exports = router;