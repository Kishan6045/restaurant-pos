const bcrypt = require("bcrypt");
const User = require("../models/User-Model");



// ---------------- CREATE USER ----------------
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!["cashier", "kitchen"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const alreadyUser = await User.findOne({ email });
        if (alreadyUser) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hash,
            role
        });

        res.status(201).json({
            message: "User created",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


