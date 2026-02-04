module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      token: {
        type: DataTypes.TEXT,
        allowNull: false
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: "refresh_tokens",
      timestamps: false
    }
  );

  return RefreshToken;
};
