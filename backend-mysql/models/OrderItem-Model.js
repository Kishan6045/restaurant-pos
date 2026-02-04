module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      price: {
        type: DataTypes.FLOAT,
        allowNull: false
      },

      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "preparing",
          "ready",
          "served"
        ),
        defaultValue: "pending"
      }
    },
    {
      tableName: "order_items",
      timestamps: true
    }
  );

  return OrderItem;
};
