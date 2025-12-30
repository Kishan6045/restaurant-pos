const Category = require("../models/Category-Model");
const Product = require("../models/Products-Model");

// CREATE CATEGORY (ADMIN ONLY)
const createCategory = async (req, res) => {
    try {
        const { name, cuisine } = req.body;

        // Validation
        if (!name || !cuisine) {
            return res.status(400).json({  message: "Category name and cuisine are required" });
        }

        // Duplicate check (case-insensitive)
        const exists = await Category.findOne({
            name: { $regex: `^${name.trim()}$`, $options: "i" },
            cuisine
        });

        if (exists) {
            return res.status(409).json({
                message: "Category already exists for this cuisine"
            });
        }

        // Create category
        const category = await Category.create({
            name: name.trim(),
            cuisine
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
const getCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",          // collection name
          localField: "_id",
          foreignField: "category",
          as: "products"
        }
      },
      {
        $addFields: {
          productCount: {
            $size: {
              $filter: {
                input: "$products",
                as: "p",
                cond: { $eq: ["$$p.isActive", true] }
              }
            }
          }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
};



// GET PRODUCTS UNDER A CATEGORY
const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await Product.find({
      category: id,
      isActive: true
    })
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch category products",
      error
    });
  }
};

// Update category (ADMIN ONLY)
const updateCategory = async (req, res) => {
    try {
        const { name, cuisine } = req.body;

        if (!name || !cuisine) {
            return res.status(400).json({
                message: "Category name and cuisine are required"
            });
        }

        //  duplicate check (same name + same cuisine)
        const exists = await Category.findOne({
            _id: { $ne: req.params.id }, // current category ko ignore karo
            name: { $regex: `^${name.trim()}$`, $options: "i" },
            cuisine
        });

        if (exists) {
            return res.status(409).json({
                message: "Category already exists for this cuisine"
            });
        }

        //update name + cuisine both
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                cuisine          // cuisine bhi update karo
            },
            {
                new: true,
                runValidators: true // schema validation
            }
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
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },   // soft delete
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deactivated successfully", category });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({ message: "Delete failed" });
    }
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryProducts,
    updateCategory,
    deleteCategory
};
