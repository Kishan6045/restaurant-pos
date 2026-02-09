module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",     // Model name
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
        type: DataTypes.FLOAT,   // float 123.45 type
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
        defaultValue: true   // Kitchen  stock control
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true   //
      }
    },
    {
      tableName: "products",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["name", "categoryId", "isActive"]  // composite unique  index saying active products only 
        }
      ]
    }
  );

  return Product;
};
