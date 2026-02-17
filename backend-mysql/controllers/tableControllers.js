const { Table } = require("../models");
const { Op } = require("sequelize");

// ===== CREATE TABLE (controller) ================================== //
const createTable = async (req, res) => {
  try {
    let { tableNumber, floor } = req.body;

    if (tableNumber === undefined) {
      return res.status(400).json({
        message: "Table number is required"
      });
    }

    tableNumber = parseInt(tableNumber);

    if (isNaN(tableNumber) || tableNumber <= 0) {
      return res.status(400).json({
        message: "Table number must be a positive integer"
      });
    }

    const allowedFloors = ["Ground", "First", "Second"];
    if (floor && !allowedFloors.includes(floor)) {
      return res.status(400).json({
        message: `Invalid floor. Allowed values: ${allowedFloors.join(", ")}`   // optional validation
      });
    }

    const finalFloor = floor || "Ground";

    const lastTable = await Table.findOne({
      where: { floor: finalFloor },
      order: [["tableNumber", "DESC"]]  // descending order to get the highest table number on that floor
    });

    const expectedTableNumber = lastTable ? lastTable.tableNumber + 1 : 1;   // auto-increment logic based on the last table number on the same floor
    if (tableNumber !== expectedTableNumber) {
      return res.status(400).json({
        message: `Table number must be ${expectedTableNumber} for ${finalFloor} floor`
      });
    }

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

    res.status(201).json({ message: "Table created successfully", table });

  } catch (error) {
    console.error("Create table error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// === UPDATE TABLE [STATUS] (controller) ================= //
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



// ================= Update Table (controller) ================= //
const updateTable = async (req, res) => {
  try {
    const { tableNumber, floor, status } = req.body;  // get values from request body

    const table = await Table.findByPk(req.params.id);  // find table by ID

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const allowedFloors = ["Ground", "First", "Second"];  // Allowed floor list
    const newFloor = floor ?? table.floor;  // new floor undinefined ho to old floor use kare ga

    // check if vaild floor provided
    if (!allowedFloors.includes(newFloor)) {
      return res.status(400).json({
        message: `Invalid floor. Allowed values: ${allowedFloors.join(", ")}`
      });
    }

    const newTableNumber =
      tableNumber !== undefined
        ? parseInt(tableNumber)  // number cinvert kare ga
        : table.tableNumber;  // old table number use kare ga

    if (isNaN(newTableNumber) || newTableNumber <= 0) {
      return res.status(400).json({ message: "Table number must be a positive integer" });
    }

    const lastTable = await Table.findOne({
      where: {
        floor: newFloor,
        id: { [Op.ne]: table.id }  //chek kare ga abhi hai vo record me na ho ya nahi
      },
      order: [["tableNumber", "DESC"]]  // highest table number on the new floor (excluding current table)
    });

    const expectedTableNumber = lastTable
      ? lastTable.tableNumber + 1
      : 1;

    // allow same number (if floor not changed) or next sequence number (if floor changed)
    if (
      newTableNumber !== table.tableNumber && // allow same number
      newTableNumber !== expectedTableNumber  // allow next sequence
    ) {
      return res.status(400).json({
        message: `Table number must remain ${table.tableNumber} or be ${expectedTableNumber} for ${newFloor} floor`
      });
    }

    // Check for duplicate table number on the same floor (excluding current table)
    const exists = await Table.findOne({
      where: {
        id: { [Op.ne]: table.id },
        tableNumber: newTableNumber,
        floor: newFloor
      }
    });

    if (exists) {
      return res.status(409).json({
        message: `Table ${newTableNumber} already exists`
      });
    }

    // status validation
    if (status !== undefined && !["available", "occupied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await table.update({
      tableNumber: newTableNumber,
      floor: newFloor,
      status: status ?? table.status
    });

    res.json({ message: "Table updated successfully", table });

  } catch (error) {
    console.error("Update table error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ===========  GET ALL TABLES (controller) ================= //
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



// ============  DELETE TABLE (controller) ================= //
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
