const { Category, Product, Sequelize } = require("../models");
const { Op } = require("sequelize"); // for operators like NOT EQUAL 


// CREATE CATEGORY (controller)
const createCategory = async (req, res) => {
  try {
    const { name, cuisine } = req.body;

    if (!name || !cuisine) {
      return res.status(400).json({
        message: "Category name and cuisine are required"
      });
    }

    const trimmedName = name.trim().toLowerCase();  // extra spa removal and lowercase conversion

    const existingCategory = await Category.findOne({  // duplicate check
      where: {
        [Op.and]: [    // multiple conditions ke liye AND operator
          { cuisine },   // same cuisine check
          { isActive: true },  // only active categories check
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),  // convert column value to lowercase
            trimmedName
          )
        ]
      }
    });

    if (existingCategory) {   // duplicate found
      return res.status(409).json({
        message: "Category already exists for this cuisine"
      });
    }

    const category = await Category.create({  // create new category
      name: name.trim(),  // extra spaces removed
      cuisine,
      isActive: true
    });

    res.status(201).json({
      message: "Category created successfully",
      category
    });

  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed Create Category" });
  }
};



// UPDATE CATEGORY (controller)
const updateCategory = async (req, res) => {
  try {
    const { name, cuisine } = req.body;

    if (!name || !cuisine) {
      return res.status(400).json({
        message: "Category name and cuisine are required"
      });
    }

    const exists = await Category.findOne({
      where: {
        [Op.and]: [    // multiple conditions ke liye AND operator
          { id: { [Op.ne]: req.params.id } }, // current id ignore
          { cuisine },   // same cuisine check
          { isActive: true }, // only active categories check
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            name.trim().toLowerCase() // trimmed and lowercased
          )
        ]
      }
    });

    if (exists) {     // duplicate found
      return res.status(409).json({
        message: "Category already exists for this cuisine"
      });
    }

    const category = await Category.findByPk(req.params.id);   // find category by id
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // SAME DATA CHECK
    if (
      category.name.toLowerCase() === name.trim().toLowerCase() &&
      category.cuisine === cuisine
    ) {
      return res.status(409).json({
        message: "Already exists with same data"
      });
    }
    await category.update({
      name: name.trim(),
      cuisine
    });

    res.status(200).json({
      message: "Category updated successfully",
      category
    });

  } catch (error) {
    res.status(500).json({ message: "Category Update failed" });
  }
};



// GET ALL CATEGORIES (controller)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      include: [
        {
          model: Product,
          as: "products",    // products ki ginti ke liye    
          attributes: ["id"],  // sirf product id chahiye count ke liye
          where: { isActive: true }, // sirf active products count karne hain
          required: false       // products na ho to bhi category aani chahiye
        }
      ],
      order: [["createdAt", "DESC"]]   // newest first old last
    });

    const formatted = categories.map(c => ({
      id: c.id,
      name: c.name,
      cuisine: c.cuisine,
      isActive: c.isActive,
      productCount: c.products ? c.products.length : 0,  // active products ki ginti 
      createdAt: c.createdAt
    }));

    res.status(200).json({
      success: true,
      categories: formatted
    });

  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
};



// GET PRODUCTS UNDER CATEGORY (controller)
const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;  // category id

    const category = await Category.findOne({  // Fetch category details
      where: { id, isActive: true },   // only active category
      attributes: ["id", "name", "cuisine"]  // sirf yehi details chahiye
    });

    if (!category) {    // category nahi mili
      return res.status(200).json({
        category: null,
        products: []
      });
    }

    //  Fetch products under this category
    const products = await Product.findAll({  // active products hi chahiye
      where: {
        categoryId: id,
        isActive: true
      },
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json({
      category,   // category details
      products    // all products under this category
    });

  } catch (error) {
    console.error("GET CATEGORY PRODUCTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch category products",
      error
    });
  }
};



// DELETE CATEGORY (SOFT DELETE) (controller)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);  // find category by id

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({ isActive: false });  // soft delete by setting isActive to false

    res.status(200).json({
      message: "Category deactivated successfully",
      category   // return the deactivated category
    });

  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Category Delete failed" });
  }
};


module.exports = {
  createCategory,
  getCategories,
  getCategoryProducts,
  updateCategory,
  deleteCategory
};
