module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      price: {
        type: DataTypes.FLOAT,   // for money, DECIMAL(10,2) bhi use kar sakte ho
        allowNull: false
      },

      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      image: {
        type: DataTypes.STRING,
        allowNull: false
      },

      isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true   // Kitchen / stock control
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true   // Admin control
      }
    },
    {
      tableName: "products",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["name", "categoryId"]  // ek category mein same name waala product nahi ho sakta
        }
      ]
    }
  );

  return Product;
};
