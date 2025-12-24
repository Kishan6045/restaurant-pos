const jwt = require("jsonwebtoken");   //token bana ta hai es liye har bar nai bata na padta ki kon entry kar raha hai

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    
    const token = authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invaild token" });
    }
};