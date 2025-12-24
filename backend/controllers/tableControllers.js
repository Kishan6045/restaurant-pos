const Table = require("../models/Table-Model");

const createTable = async (req, res) => {
    try {
        const { tableNumber } = req.body;

        // Validation
        if (!tableNumber) {
            return res.status(400).json({
                message: "Table number is required"
            });
        }

        // Duplicate check
        const exists = await Table.findOne({ tableNumber });
        if (exists) {
            return res.status(409).json({
                message: `Table ${tableNumber} already exists`
            });
        }

        // Create table
        const table = await Table.create({
            tableNumber,
            status: "available"
        });

        res.status(201).json({
            message: "Table created successfully",
            table
        });

    } catch (error) {
        console.error("Create table error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = { createTable };