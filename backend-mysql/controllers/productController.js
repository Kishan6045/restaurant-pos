const { Product, Category, Sequelize } = require("../models");
const { Op } = require("sequelize");

/* ================= CREATE PRODUCT ================= */
const createProduct = async (req, res) => {
  try {
    const { name, price, categoryId } = req.body;
    const image = req.file?.path;

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

    // category active check
    const categoryExists = await Category.findOne({
      where: { id: categoryId, isActive: true }
    });

    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const trimmedName = name.trim().toLowerCase();

    // 🔍 check existing product (case-insensitive)
    const existingProduct = await Product.findOne({
      where: {
        categoryId,
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          trimmedName
        )
      }
    });

    // 👉 CASE 1: exists but inactive → reactivate
    if (existingProduct && existingProduct.isActive === false) {
      await existingProduct.update({
        price,
        image,
        isActive: true
      });

      return res.status(200).json({
        message: "Product re-activated successfully",
        product: existingProduct
      });
    }

    // 👉 CASE 2: exists & active → error
    if (existingProduct && existingProduct.isActive === true) {
      return res.status(409).json({
        message: "Product already exists in this category"
      });
    }

    // 👉 CASE 3: new product
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


/* ================= GET PRODUCTS ================= */
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: "category",            // ✅ VERY IMPORTANT
          where: { isActive: true },
          attributes: ["id", "name", "cuisine"], // ✅ only needed fields
          required: true
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({ products });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


/* ================= UPDATE PRODUCT ================= */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, categoryId } = req.body;
    const image = req.file?.path;

    const categoryIdNum =
      categoryId !== undefined && categoryId !== null && categoryId !== ""
        ? Number(categoryId)
        : null;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const finalCategoryId =
      Number.isInteger(categoryIdNum) && categoryIdNum > 0
        ? categoryIdNum
        : product.categoryId;

    // name update + duplicate check
    if (name) {
      const exists = await Product.findOne({
        where: {
          id: { [Op.ne]: id },
          categoryId: {
            [Op.eq]: finalCategoryId
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
      if (Number.isInteger(categoryIdNum) && categoryIdNum > 0) {
      const categoryExists = await Category.findOne({
        where: { id: categoryIdNum, isActive: true }
      });

      if (!categoryExists) {
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

/* ================= DELETE PRODUCT (SOFT) ================= */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

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
