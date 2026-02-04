const Sequelize = require("sequelize");
const sequelize = require("../config/db");

// import models (WITH SAME NAMES)
const User = require("./User-Model")(sequelize, Sequelize.DataTypes);
const Category = require("./Category-Model")(sequelize, Sequelize.DataTypes);
const Product = require("./Product-Model")(sequelize, Sequelize.DataTypes);
const Table = require("./Table-Model")(sequelize, Sequelize.DataTypes);
const Order = require("./Order-Model")(sequelize, Sequelize.DataTypes);
const Payment = require("./Payment-Model")(sequelize, Sequelize.DataTypes);
const Permission = require("./Permission-Model")(sequelize, Sequelize.DataTypes);
const RefreshToken = require("./RefreshToken-Model")(sequelize, Sequelize.DataTypes);

// SQL extra tables (MUST EXIST)
const OrderItem = require("./OrderItem-Model")(sequelize, Sequelize.DataTypes);
const PermissionItem = require("./PermissionItem-Model")(sequelize, Sequelize.DataTypes);

/* ========== ASSOCIATIONS ========== */

// Category ↔ Product
Category.hasMany(Product, { foreignKey: "categoryId" , as: "products"});
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category"   });

// Table ↔ Order
Table.hasMany(Order, { foreignKey: "tableId" });
Order.belongsTo(Table, { foreignKey: "tableId" });

// Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product ↔ OrderItem
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

// Order ↔ Payment
Order.hasMany(Payment, { foreignKey: "orderId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });

// User ↔ Payment
User.hasMany(Payment, { foreignKey: "receivedBy" });
Payment.belongsTo(User, { foreignKey: "receivedBy" });

// Permission ↔ PermissionItem
Permission.hasMany(PermissionItem, { foreignKey: "permissionId" });
PermissionItem.belongsTo(Permission, { foreignKey: "permissionId" });

// User ↔ RefreshToken
User.hasMany(RefreshToken, { foreignKey: "userId" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Product,
  Table,
  Order,
  OrderItem,
  Payment,
  Permission,
  PermissionItem,
  RefreshToken
};
