const { Product, Category, Sequelize } = require("../models");
const { Op } = require("sequelize");

// ------------ CREATE PRODUCT (controller) ------------------------ //
const createProduct = async (req, res) => {
  try {
    const { name, price, categoryId } = req.body;
    const image = req.file?.path;   // from multer middleware

    if (!name || !price || !categoryId || !image) {
      return res.status(400).json({
        message: "Name, price, category & image required"
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than zero"
      });
    }

    const categoryExists = await Category.findOne({   // category active check
      where: { id: categoryId, isActive: true }
    });

    if (!categoryExists) {    
      return res.status(404).json({ message: "Category not found" });
    }

    const trimmedName = name.trim().toLowerCase();

    //  check existing product (case-insensitive)
    const existingProduct = await Product.findOne({
      where: {
        categoryId,
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")), // case-insensitive comparison
          trimmedName  // already trimmed and lowercased
        )
      }
    });

    // product already exists and active 
    if (existingProduct && existingProduct.isActive === true) {
      return res.status(409).json({
        message: "Product already exists in this category"
      });
    }

    // create new product
    const product = await Product.create({
      name: name.trim(),
      price,
      categoryId,
      image,
      isActive: true
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};




// ------------- UPDATE PRODUCT (controller) -----------------------//
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;  // product id from URL
    const { name, price, categoryId } = req.body;  // fields to update from request body
    const image = req.file?.path;  // new image path from multer middleware

    // null if not provided
    const categoryIdNum =  categoryId !== undefined && categoryId !== null && categoryId !== ""  // conditions
        ? Number(categoryId)  // convert to number if valid
        : null;               // else null

    const product = await Product.findByPk(id);  // findbypk means primary key only chek
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const finalCategoryId =  // if valid categoryId provided, use it; else keep existing
      Number.isInteger(categoryIdNum) && categoryIdNum > 0  // valid number check
        ? categoryIdNum     // if valid, use new categoryId
        : product.categoryId;  // else keep existing categoryId

    // name update + duplicate check
    if (name) {
      const exists = await Product.findOne({
        where: {
          id: { [Op.ne]: id }, // current product ingrore karo update ke time // [op.ne] means not equal
          categoryId: {
            [Op.eq]: finalCategoryId   // check in the final category
          },
          isActive: true,
          name: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            name.trim().toLowerCase()
          )
        }
      });

      if (exists) {
        return res.status(409).json({
          message: "Product already exists in this category"
        });
      }
      product.name = name;
    }

    // price update
    if (price !== undefined) {  
      if (price <= 0) {
        return res.status(400).json({
          message: "Price must be greater than zero"
        });
      }
      product.price = price;
    }

    // category update
      if (Number.isInteger(categoryIdNum) && categoryIdNum > 0) { // valid categoryId provided
      const categoryExists = await Category.findOne({
        where: { id: categoryIdNum, isActive: true }  // check if new category exists and active
      });

      if (!categoryExists) {  // if new categoryId provided but not found or inactive, return error
        return res.status(404).json({ message: "Category not found" });
      }
      product.categoryId = categoryIdNum;
    }

    // image update
    if (image) {
      product.image = image;
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



//------------- GET PRODUCTS (controller)------------------------ //
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [                      // eager loading with category details
        {
          model: Category,       // include category details
          as: "category",        // as means alias for association defined in model
          where: { isActive: true },
          attributes: ["id", "name", "cuisine"],   // only these category fields will be included in the response
          required: true     // inner join: only products with active category will be returned. If false, it would be left join and return products even if category is inactive (with category as null)
        }
      ],
      order: [["createdAt", "DESC"]]   // latest products first 
    });

    res.status(200).json({ products });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



// ----------- DELETE PRODUCT (controller) ---------------------- //
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;  // product id from URL

    const product = await Product.findByPk(id);  
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update({ isActive: false });

    res.status(200).json({
      message: "Product deactivated successfully"
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
};
