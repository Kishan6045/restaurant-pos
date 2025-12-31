const express = require("express");
const router = express.Router();

// IMPORT MIDDLEWARES
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

//IMPORT CONTROLLER
const { createTable,
    updateTableStatus,
    getTables,
    deleteTable,
    updateTable
} = require("../controllers/tableControllers");

// CREATE TABLE (ADMIN ONLY)
router.post("/", auth, role("admin"), createTable)  

// update table (status)  
router.patch("/:id/status", auth, updateTableStatus);

// update full table details (admin)
router.put("/:id", auth, role("admin"), updateTable);

// get all tables
router.get("/", auth, getTables);

// delete table
router.delete("/:id", auth, role("admin"), deleteTable);


module.exports = router;
