const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const {
    getRolePermissions,
    updateRolePermissions
} = require("../controllers/permissionController");

// Get Role Permissions
router.get(
    "/matrix",
    auth,
    role("admin"),
    getRolePermissions
);

// Update Role Permissions
router.put(
    "/",
    auth,
    role("admin"),
    updateRolePermissions
);



module.exports = router;