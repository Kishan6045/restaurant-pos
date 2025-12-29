const Category = require("../models/Category-Model");

// CREATE CATEGORY (ADMIN ONLY)
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Validation
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        // Duplicate check (case-insensitive)
        const exists = await Category.findOne({
            name: { $regex: `^${name.trim()}$`, $options: "i" }
        });

        if (exists) {
            return res.status(409).json({
                message: "Category already exists"
            });
        }

        // Create category
        const category = await Category.create({
            name: name.trim()
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// Get all categories
const  getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
};



// Update category (ADMIN ONLY)
const  updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};



// Delete category (ADMIN ONLY)
const  deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
