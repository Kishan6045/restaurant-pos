module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define(
    "Table",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      tableNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      floor: {
        type: DataTypes.STRING,
        defaultValue: "Ground"
      },

      status: {
        type: DataTypes.ENUM("available", "occupied"),
        defaultValue: "available"
      }
    },
    {
      tableName: "tables",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["tableNumber", "floor"] // 👈 same as Mongo compound index
        }
      ]
    }
  );

  return Table;
};
