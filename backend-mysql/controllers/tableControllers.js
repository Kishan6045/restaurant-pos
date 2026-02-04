const { Table } = require("../models");
const { Op } = require("sequelize");

/* ================= CREATE TABLE ================= */
const createTable = async (req, res) => {
  try {
    const { tableNumber, floor } = req.body;

    if (tableNumber === undefined) {
      return res.status(400).json({
        message: "Table number is required"
      });
    }

    const finalFloor = floor || "Ground";

    // duplicate check (tableNumber + floor)
    const exists = await Table.findOne({
      where: {
        tableNumber,
        floor: finalFloor
      }
    });

    if (exists) {
      return res.status(409).json({
        message: `Table ${tableNumber} already exists on ${finalFloor} floor`
      });
    }

    const table = await Table.create({
      tableNumber,
      floor: finalFloor,
      status: "available"
    });

    res.status(201).json({
      message: "Table created successfully",
      table
    });

  } catch (error) {
    console.error("Create table error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE TABLE STATUS ================= */
const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["available", "occupied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    await table.update({ status });

    res.json({
      message: "Table status updated",
      table
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= FULL / PARTIAL UPDATE ================= */
const updateTable = async (req, res) => {
  try {
    const { tableNumber, floor, status } = req.body;

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // validate status if provided
    if (status !== undefined && !["available", "occupied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // duplicate check if tableNumber/floor change
    const newTableNumber = tableNumber ?? table.tableNumber;
    const newFloor = floor ?? table.floor;

    if (
      newTableNumber !== table.tableNumber ||
      newFloor !== table.floor
    ) {
      const exists = await Table.findOne({
        where: {
          id: { [Op.ne]: table.id },
          tableNumber: newTableNumber,
          floor: newFloor
        }
      });

      if (exists) {
        return res.status(409).json({
          message: `Table ${newTableNumber} already exists on ${newFloor} floor`
        });
      }
    }

    await table.update({
      tableNumber: newTableNumber,
      floor: newFloor,
      status: status ?? table.status
    });

    res.json({
      message: "Table updated successfully",
      table
    });

  } catch (error) {
    console.error("Update table error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ALL TABLES ================= */
const getTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      order: [["tableNumber", "ASC"]]
    });

    res.json({ tables });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE TABLE ================= */
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    if (table.status === "occupied") {
      return res.status(400).json({
        message: "Occupied table cannot be deleted"
      });
    }

    await table.destroy();

    res.json({ message: "Table deleted" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTable,
  updateTableStatus,
  updateTable,
  getTables,
  deleteTable
};
