const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const permit = require("../middlewares/permissionMiddleware");  // const role = require("../middlewares/roleMiddleware");

const {
    createStaff,
    getAllStaff,
    updateStaff,
    deleteStaff
} = require("../controllers/staffController");

// create staff - admin only
router.post(
    "/",
    auth,
    permit("staff.create"), // role("admin"),
    createStaff
);

// update staff - admin only
router.put(
    "/:id",
    auth,
    permit("staff.update"),   //  role("admin"),
    updateStaff
);

// delete staff - admin only
router.delete(
    "/:id",
    auth,
    permit("staff.delete"),  //  role("admin"),
    deleteStaff
);

// get all staff - admin only
router.get(
    "/",
    auth,
    permit("staff.read"),  // role("admin"),
    getAllStaff
);



module.exports = router;