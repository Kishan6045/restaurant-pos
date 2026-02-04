module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      role: {
        type: DataTypes.ENUM("admin", "cashier", "kitchen"),
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: "permissions",
      timestamps: false
    }
  );

  return Permission;
};
