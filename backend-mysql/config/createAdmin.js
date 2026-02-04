const bcrypt = require("bcryptjs");
const { User } = require("../models");   // 👈 Sequelize index se

const createAdmin = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

    // ✅ Sequelize way
    const adminExists = await User.findOne({
      where: { email: ADMIN_EMAIL }
    });

    if (adminExists) return;

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      name: "System Admin",
      email: ADMIN_EMAIL,
      password: hash,
      role: "admin",
      isActive: true
    });

    console.log("✅ Default Admin Created (SQL)");

  } catch (error) {
    console.error("❌ Create Admin Error:", error.message);
  }
};

module.exports = createAdmin;
