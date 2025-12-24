const User = require("../models/User-Model");
const bcrypt = require("bcrypt");

const createAdmin = async () => {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    if (adminExists) return;

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
        name: "System Admin",
        email: ADMIN_EMAIL,
        password: hash,
        role: "admin"
    });

    console.log("✅ Default Admin Created");
};

module.exports = createAdmin;
