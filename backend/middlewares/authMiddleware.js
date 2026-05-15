const jwt = require("jsonwebtoken");   //token bana ta hai es liye har bar nai bata na padta ki kon entry kar raha hai
const Permission = require("../models/Permission-Model");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token

        const permission = await Permission.findOne({ role: decoded.role });
        // If permissions are not seeded yet, allow auth to proceed
        // with an empty permissions array so admin can configure.
        const permissions = permission?.permissions ?? [];

     // attach user + permissions ARRAY
        req.user = {
            id: decoded.id,
            role: decoded.role,
            permissions
        };
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

