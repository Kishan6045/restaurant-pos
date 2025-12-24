const Product = require("../models/Products-Model");

const createProduct = async (req, res) => {
    try {
        const { name, price, category } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ message: "All fields required" });
        }

        const exists = await Product.findOne({ name });
        if (exists) {
            return res.status(409).json({ message: "Product already exists" });
        }

        const product = await Product.create({ name, price, category });

        res.status(201).json({
            message: "Product created",
            product
        });
    } catch (error) {
        res.status(500).json({ message: "Server error",error });
    }
};

module.exports = { createProduct };
