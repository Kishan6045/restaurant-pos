const jwt = require("jsonwebtoken");   //token bana ta hai es liye har bar nai bata na padta ki kon entry kar raha hai
const Permission = require("../models/Permission-Model");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);



        // fetch permission by role
        const permission = await Permission.findOne({
            role: decoded.role
        });
        if (!permission) {
            return res.status(403).json({ message: "Permissions not found" });
        }

    // attach user + permissions ARRAY
        req.user = {
            id: decoded.id,
            role: decoded.role,
            permissions: permission?.permissions || []
        };
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

