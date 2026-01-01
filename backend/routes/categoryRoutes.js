const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { createCategory,
        getCategories,
        getCategoryProducts,
        updateCategory,
        deleteCategory

 } = require("../controllers/categoryController");


 // GET ALL CATEGORIES
router.get("/", auth, role("admin", "cashier", "kitchen"), getCategories);

// VIEW PRODUCTS UNDER CATEGORY
router.get(
  "/:id/products",
  auth,
  role("admin", "cashier", "kitchen"),
  getCategoryProducts
);

// CREATE CATEGORY
router.post("/", auth, role("admin"), createCategory);

// UPDATE CATEGORY
router.put("/:id", auth, role("admin"), updateCategory);

// DELETE CATEGORY
router.delete("/:id", auth, role("admin"), deleteCategory);




module.exports = router;