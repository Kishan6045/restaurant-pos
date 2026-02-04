const { Permission, PermissionItem } = require("../models");

/* ================= GET ROLE PERMISSIONS ================= */
exports.getRolePermissions = async (req, res) => {
  try {
    const data = await Permission.findAll({
      include: [
        {
          model: PermissionItem,
          attributes: ["permission"]
        }
      ]
    });

    const result = {
      admin: [],
      cashier: [],
      kitchen: []
    };

    data.forEach(p => {
      result[p.role] = p.PermissionItems.map(i => i.permission);
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE ROLE PERMISSIONS ================= */
exports.updateRolePermissions = async (req, res) => {
  let { role, permissions } = req.body;

  if (!["admin", "cashier", "kitchen"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // normalize permissions
  permissions = (permissions || []).map(p => p.toLowerCase());

  try {
    // ensure role exists
    let permission = await Permission.findOne({
      where: { role }
    });

    if (!permission) {
      permission = await Permission.create({ role });
    }

    // delete old permissions
    await PermissionItem.destroy({
      where: { permissionId: permission.id }
    });

    // insert new permissions
    if (permissions.length > 0) {
      await PermissionItem.bulkCreate(
        permissions.map(p => ({
          permissionId: permission.id,
          permission: p
        }))
      );
    }

    res.json({ message: "Permissions updated" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
