const User = require("../models/User-Model");
const bcrypt = require("bcrypt");

const createKitchen = async () => {
    const { KITCHEN_EMAIL, KITCHEN_PASSWORD } = process.env;

    if (!KITCHEN_EMAIL || !KITCHEN_PASSWORD) return;

    const exists = await User.findOne({ email: KITCHEN_EMAIL });
    if (exists) return;

    const hash = await bcrypt.hash(KITCHEN_PASSWORD, 10);

    await User.create({
        name: "Kitchen Staff",
        email: KITCHEN_EMAIL,
        password: hash,
        role: "kitchen"
    });

    console.log("✅ Kitchen User Created");
};

module.exports = createKitchen;
