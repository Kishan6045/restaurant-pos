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

module.exports = {createCategory};
