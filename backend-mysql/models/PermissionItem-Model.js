module.exports = (sequelize, DataTypes) => {
  const PermissionItem = sequelize.define(
    "PermissionItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      permission: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: "permission_items",
      timestamps: false
    }
  );

  return PermissionItem;
};
