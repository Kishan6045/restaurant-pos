const express = require("express");
const router = express.Router();

// IMPORT MIDDLEWARES
const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware");   //const role = require("../middlewares/roleMiddleware");

//IMPORT CONTROLLER
const { createTable,
    updateTableStatus,
    getTables,
    deleteTable,
    updateTable
} = require("../controllers/tableControllers");

// CREATE TABLE (ADMIN ONLY)
router.post(
    "/",
    auth,
    permit("tables.create"),   // role("admin"),
    createTable
)

// update table (status)  
router.patch(
    "/:id/status",
    auth,
    permit("tables.update"),
    updateTableStatus
);

// update full table details (admin)
router.put(
    "/:id",
    auth,
    permit("tables.update"),  //   role("admin"),
    updateTable
);

// get all tables
router.get(
    "/",
    auth,
    permit("tables.read"),
    getTables
);

// delete table
router.delete(
    "/:id",
    auth,
    permit("tables.delete"),   // role("admin"),
    deleteTable
);


module.exports = router;
