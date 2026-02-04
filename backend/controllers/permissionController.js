const Permission = require("../models/Permission-Model");

// GET Permissions 
exports.getRolePermissions = async (req, res) => {
  try {
    const data = await Permission.find();

    const result = {
      admin: [],
      cashier: [],
      kitchen: []
    };

    data.forEach(item => {
      result[item.role] = item.permissions || [];
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



// UPDATE Permissions
exports.updateRolePermissions = async (req, res) => {
  let { role, permissions } = req.body; 

  if (!["admin", "cashier", "kitchen"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // normalize permissions (VERY IMPORTANT)
  permissions = (permissions || []).map(p => p.toLowerCase());

  try {
    const permission = await Permission.findOne({ role });

    if (permission) {
      permission.permissions = permissions;
      await permission.save();
    } else {
      await Permission.create({ role, permissions });
    }

    res.json({ message: "Permissions updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
