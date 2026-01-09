const User = require("../models/User-Model");
const bcrypt = require("bcrypt")  // password ne Hash kar ne ke liye
const jwt = require("jsonwebtoken")  // token bana ta hai es liye har bar nai bata na padta ki kon entry kar raha hai
const RefreshToken = require("../models/RefreshToken-Model");



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

        //  delete old refresh tokens (logout all devices)
        await RefreshToken.deleteMany({ userId: user._id });

        // access token 
        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // refresh token
        const refreshToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // save refresh token in Db
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Login Successful",
            accessToken,
            refreshToken,
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// refreshToken controller
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;     // 1️Request body se refresh token lena
        if (!refreshToken)
            return res.status(401).json({ message: "token expired" });

        const decoded = jwt.verify(        // Secret galat / token expire → error throw hog
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const stored = await RefreshToken.findOne({ token: refreshToken });    // Token abhi bhi valid session ka hissa hai ya nahi
        if (!stored)
            return res.status(401).json({ message: "token expired" });

        await RefreshToken.deleteOne({ token: refreshToken });   // Purana refresh token delete karna taaki ye token dubara use na ho sake

        const newRefreshToken = jwt.sign(        //  Naya refresh token generate karna (7 din valid)
            { id: decoded.id, role: decoded.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        await RefreshToken.create({                   //  Naya refresh token database me save karna
            userId: decoded.id,
            token: newRefreshToken,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
        });

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })

    } catch (error) {
        res.status(401).json({ message: "Session expired" });
    }
};