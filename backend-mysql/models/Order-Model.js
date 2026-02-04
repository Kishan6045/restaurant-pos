module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      tableId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      orderStatus: {
        type: DataTypes.ENUM(
          "open",
          "billed",
          "completed",
          "closed"
        ),
        defaultValue: "open"
      },

      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
      },

      paymentStatus: {
        type: DataTypes.ENUM("unpaid", "paid"),
        defaultValue: "unpaid"
      },

      paymentMethod: {
        type: DataTypes.ENUM("cash", "upi", "card"),
        allowNull: true
      }
    },
    {
      tableName: "orders",
      timestamps: true
    }
  );

  return Order;
};
