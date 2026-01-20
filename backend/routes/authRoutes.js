const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getProfile,
    refreshToken,
} = require("../controllers/authController");
const authToken = require("../middlewares/authTokenMiddleware");



// Register Routes
router.post("/register", register);

// Login Routes
router.post("/login", login);

// Current user
router.get("/me", authToken, getProfile);

// refresh Routes
router.post("/refresh", refreshToken)





module.exports = router;