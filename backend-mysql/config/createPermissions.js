const { Permission, PermissionItem } = require("../models");

const ALL_PERMISSIONS = [
  "dashboard.read",
  "tables.read","tables.create","tables.update","tables.delete",
  "products.read","products.create","products.update","products.delete",
  "categories.read","categories.create","categories.update","categories.delete",
  "orders.read","orders.create","orders.cancel",
  "payments.read","payments.create",
  "billing.view",
  "kitchen.view","kitchen.update",
  "staff.read","staff.create","staff.update","staff.delete",
  "reports.read"
];

const DEFAULT_PERMISSIONS = {
  admin: ALL_PERMISSIONS,
  cashier: [
    "tables.read",
    "products.read",
    "categories.read",
    "orders.read",
    "orders.create",
    "payments.create",
    "billing.view"
  ],
  kitchen: [
    "kitchen.view",
    "kitchen.update"
  ]
};

const createPermissions = async () => {
  try {
    for (const [role, perms] of Object.entries(DEFAULT_PERMISSIONS)) {

      // 1️⃣ role exists?
      let permission = await Permission.findOne({ where: { role } });

      if (!permission) {
        permission = await Permission.create({ role });
      }

      // 2️⃣ existing permissions
      const existing = await PermissionItem.findAll({
        where: { permissionId: permission.id }
      });
      const existingSet = existing.map(p => p.permission);

      // 3️⃣ insert missing only
      for (const p of perms) {
        if (!existingSet.includes(p)) {
          await PermissionItem.create({
            permissionId: permission.id,
            permission: p
          });
        }
      }
    }

    console.log("✅ Default permissions ensured (SQL)");

  } catch (error) {
    console.error("❌ Failed to seed permissions:", error.message);
  }
};

module.exports = createPermissions;
