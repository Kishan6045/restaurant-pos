const express = require("express");
const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

// Register Routes
router.post("/register", register);

// Login Routes
router.post("/login", login);


module.exports = router;