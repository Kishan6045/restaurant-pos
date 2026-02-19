const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// ================= CREATE STAFF(controller) ================= //
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check existing user
    const exists = await User.findOne({
      where: { email }
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "cashier",
      isActive: true
    });

    res.status(201).json({
      message: "Staff created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Staff creation failed" });
  }
};


// ================= UPDATE STAFF(controller)================= //
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;

    const user = await User.findByPk(id);

    if (!user || user.role !== "cashier") {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (name) user.name = name;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Staff updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Staff update failed" });
  }
};


// ================= DELETE STAFF (SOFT) ================= //
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user || user.role !== "cashier") {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (user.isActive === false) {
      return res.status(400).json({ message: "Staff already deactivated" });
    }

    await user.update({ isActive: false });

    res.json({ message: "Staff deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Staff deletion failed" });
  }
};


// ================= GET ALL STAFF (controller) ================= //
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: "cashier" },
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]]
    });

    res.json({ staff });

  } catch (error) {
    res.status(500).json({ message: "Fetching staff failed" });
  }
};
