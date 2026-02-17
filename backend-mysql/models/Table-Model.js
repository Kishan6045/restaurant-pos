module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define(
    "Table",      // Model name 
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
        type: DataTypes.ENUM("Ground", "First", "Second"),
        allowNull: false,
        defaultValue: "Ground"
      },

      status: {
        type: DataTypes.ENUM("available", "occupied"),
        defaultValue: "available"
      }
    },
    {
      tableName: "tables",  // Table name in DB
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["tableNumber", "floor"]  // Unique constraint to prevent duplicate table numbers on the same floor
        }
      ]
    }
  );

  return Table;
};
