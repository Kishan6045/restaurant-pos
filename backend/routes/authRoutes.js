const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getProfile,
    refreshToken,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");



// Register Routes
router.post("/register", register);

// Login Routes
router.post("/login", login);

// Current user
router.get("/me", authMiddleware, getProfile);

// refresh Routes
router.post("/refresh", refreshToken)





module.exports = router;