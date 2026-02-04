const bcrypt = require("bcryptjs");
const { User } = require("../models");

const createKitchen = async () => {
  try {
    const { KITCHEN_EMAIL, KITCHEN_PASSWORD } = process.env;
    if (!KITCHEN_EMAIL || !KITCHEN_PASSWORD) return;

    // ✅ Sequelize syntax
    const exists = await User.findOne({
      where: { email: KITCHEN_EMAIL }
    });
    if (exists) return;

    const hash = await bcrypt.hash(KITCHEN_PASSWORD, 10);

    await User.create({
      name: "Kitchen Staff",
      email: KITCHEN_EMAIL,
      password: hash,
      role: "kitchen",
      isActive: true
    });

    console.log("✅ Kitchen User Created (SQL)");
  } catch (err) {
    console.error("❌ Kitchen create error:", err.message);
  }
};

module.exports = createKitchen;
