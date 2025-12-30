const Product = require("../models/Products-Model");
const Category = require("../models/Category-Model");
const cloudinary = require("../config/cloudinary");



// Create Product
const createProduct = async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const image = req.file?.path;

        if (!name || !price || !category || !image) {
            return res.status(400).json({ message: "Name, price, category & image required" });
        }

        if (price <= 0) {
            return res.status(400).json({ message: "Price must be greater than zero" });
        }

        const categoryExists = await Category.findOne({
            _id: category,
            isActive: true
        });
        if (!categoryExists) {
            return res.status(404).json({ message: "Category not found" });
        }

        const exists = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            category                                          // pizza  Pizza  PIZZA   all are considered same
        });

        if (exists) {
            return res.status(409).json({ message: "Product already exists in this category" });
        }

        const product = await Product.create({ name, price, category, image, isActive: true });

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// get products
const getProducts = async (req, res) => {
    try {
        const products = await Product
            .find({ isActive: true })
            .populate("category")
            .sort({ createdAt: -1 });
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};





// update product   
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category } = req.body;
        const image = req.file?.path;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // name update
        if (name) {
            const exists = await Product.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${name}$`, "i") },
                category: category || product.category
            });

            if (exists) {
                return res.status(409).json({ message: "Product already exists in this category" });
            }
            product.name = name;
        }

        // price update
        if (price) {
            if (price <= 0) {
                return res.status(400).json({ message: "Price must be greater than zero" });
            }
            product.price = price;
        }
        // category update
        if (category) {
            const categoryExists = await Category.findOne({
                _id: category,
                isActive: true
            });
            if (!categoryExists) {
                return res.status(404).json({ message: "Category not found" });
            }
            product.category = category;
        }
        // image update
        if (image) product.image = image;
        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isActive = false;
        await product.save();
        res.status(200).json({ message: "Product deactivated successfully" });
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
