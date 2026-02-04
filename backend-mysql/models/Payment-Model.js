module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
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

      amount: {
        type: DataTypes.FLOAT,   // or DECIMAL(10,2) for accuracy
        allowNull: false
      },

      method: {
        type: DataTypes.ENUM("cash", "upi", "card"),
        allowNull: false
      },

      paidAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },

      receivedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: "payments",
      timestamps: false   // Mongo schema me timestamps nahi the
    }
  );

  return Payment;
};
