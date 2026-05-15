const Table = require("../models/Table-Model");

// Create a new table
const createTable = async (req, res) => {
    try {
        const { tableNumber, floor } = req.body;

        // Validation
        if (!tableNumber) {
            return res.status(400).json({
                message: "Table number is required"
            });
        }

        // Duplicate check
        const exists = await Table.findOne({
            tableNumber,
            floor: floor || "Ground"
        });
        if (exists) {
            return res.status(409).json({
                message: `Table ${tableNumber} already exists on ${floor || "Ground"} floor`
            });
        }

        // Create table
        const table = await Table.create({
            tableNumber,
            floor: floor || "Ground",
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

// update table( status )
const updateTableStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["available", "occupied"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        table.status = status;
        await table.save();
        res.json({ message: "Table status updated", table });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


// upate full table details 
// FULL / PARTIAL TABLE UPDATE (ADMIN)
const updateTable = async (req, res) => {
    try {
        const { tableNumber, floor, status } = req.body;

        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        // Optional updates (safe)
        if (tableNumber !== undefined) table.tableNumber = tableNumber;
        if (floor !== undefined) table.floor = floor;
        if (status !== undefined) {
            if (!["available", "occupied"].includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }
            table.status = status;
        }

        await table.save();

        res.json({
            message: "Table updated successfully",
            table
        });

    } catch (error) {
        console.error("Update table error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



// GET ALL TABLES (paginated; supports cashier `limit` up to 500)
const getTables = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limitRaw = parseInt(req.query.limit, 10);
        const limit = Math.min(Math.max(limitRaw || 10, 1), 500);
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.floor) {
            filter.floor = req.query.floor;
        }

        const [tables, total] = await Promise.all([
            Table.find(filter).sort({ floor: 1, tableNumber: 1 }).skip(skip).limit(limit).lean(),
            Table.countDocuments(filter),
        ]);

        res.json({
            tables,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// delete table
const deleteTable = async (req, res) => {
    const table = await Table.findById(req.params.id);

    if (!table) {
        return res.status(404).json({ message: "Table not found" });
    }

    if (table.status === "occupied") {
        return res.status(400).json({ message: "Occupied table cannot be deleted" });
    }
    await table.deleteOne();
    res.json({ message: "Table deleted" });
};




module.exports = {
    createTable,
    updateTableStatus,
    updateTable,
    getTables,
    deleteTable
};