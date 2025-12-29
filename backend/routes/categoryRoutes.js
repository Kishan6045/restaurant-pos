const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { createCategory,
        getCategories,
        updateCategory,
        deleteCategory

 } = require("../controllers/categoryController");


 // GET ALL CATEGORIES
router.get("/", auth, role("admin"), getCategories);

// CREATE CATEGORY
router.post("/", auth, role("admin"), createCategory);

// UPDATE CATEGORY
router.put("/:id", auth, role("admin"), updateCategory);

// DELETE CATEGORY
router.delete("/:id", auth, role("admin"), deleteCategory);




module.exports = router;