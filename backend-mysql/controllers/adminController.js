const bcrypt = require("bcryptjs");
const { User } = require("../models");

// ---------------- CREATE USER ----------------
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ role validation (same)
    if (!["cashier", "kitchen"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ Sequelize syntax
    const alreadyUser = await User.findOne({
      where: { email }
    });

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
      role,
      isActive: true
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user.id,        // 👈 SQL id
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
