module.exports = (sequlize, DataTypes) => {
  const Category = sequlize.define(
    "Category",  // Model ka naam (not) table ka naam
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,  //Unique hota hai
        autoIncrement: true,  //automatically increase hogi
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,  //null nahi ho sakta
      },

      cuisine: {
        type: DataTypes.ENUM("Gujarati", "Punjabi", "Chinese", "Common"),
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,  // boolean type true(1)/false(0)
        defaultValue: true,
      }
    },
    {
      tableName: "categories", // table ka naam
      timestamps: true,  // createdAt and updatedAt columns automatically add ho jayenge
      indexes: [
        {
          unique: true,
          fields: ["name", "cuisine"]  // combination of name and cuisine should be unique
        }
      ]
    }
  );
  return Category;
};