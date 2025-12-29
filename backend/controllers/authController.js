const User = require("../models/User-Model");
const bcrypt = require("bcrypt")  // password ne Hash kar ne ke liye
const jwt = require("jsonwebtoken")  // token bana ta hai es liye har bar nai bata na padta ki kon entry kar raha hai



// Register Controller
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashPassword,
            role: "cashier"
        });
        res.status(201).json({
            message: "User registered",
            user
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User
            .findOne({ email })
            .select("+password");
        if (!user)
            return res.status(401).json({ message: "Invalid email or password" });
        if (!user.isActive)
            return res.status(403).json({ message: "User is blocked" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: " Invalid email or password" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({
            message: "Login Successful",
            token,
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


