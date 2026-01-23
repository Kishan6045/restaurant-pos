const Permission = require("../models/Permission-Model");

const ALL_PERMISSIONS = [
    "dashboard.read",
    "tables.read",
    "tables.create",
    "tables.update",
    "tables.delete",
    "products.read",
    "products.create",
    "products.update",
    "products.delete",
    "categories.read",
    "categories.create",
    "categories.update",
    "categories.delete",
    "orders.read",
    "orders.create",
    "orders.cancel",
    "payments.read",
    "payments.create",
    "kitchen.view",
    "kitchen.update",
    "staff.read",
    "staff.create",
    "staff.update",
    "staff.delete",
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
        "payments.create"
    ],
    kitchen: [
        "kitchen.view",
        "kitchen.update"
    ]
};

const createPermissions = async () => {
    try {
        await Promise.all(
            Object.entries(DEFAULT_PERMISSIONS).map(([role, permissions]) =>
                Permission.updateOne(
                    { role },
                    {
                        $setOnInsert: { role },
                        $addToSet: { permissions: { $each: permissions } }
                    },
                    { upsert: true }
                )
            )
        );
        console.log("✅ Default permissions ensured");
    } catch (error) {
        console.error("❌ Failed to seed permissions:", error.message);
    }
};

module.exports = createPermissions;
