const jwt = require("jsonwebtoken");
const { Permission, PermissionItem } = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1️⃣ verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2️⃣ fetch permission by role
    const permission = await Permission.findOne({
      where: { role: decoded.role },
      include: [
        {
          model: PermissionItem,
          attributes: ["permission"]
        }
      ]
    });

    // 3️⃣ normalize permissions array
    const permissions = permission
      ? permission.PermissionItems.map(p => p.permission)
      : [];

    // 4️⃣ attach user + permissions
    req.user = {
      id: decoded.id,
      role: decoded.role,
      permissions
    };

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
