const express = require("express");
const router = express.Router();

const {
    register,
    login,
    refreshToken,
} = require("../controllers/authController");



// Register Routes
router.post("/register", register);

// Login Routes
router.post("/login", login);

// refresh Routes
router.post("/refresh", refreshToken)





module.exports = router;