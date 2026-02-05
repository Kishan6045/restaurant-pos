require("dotenv").config();
const chalk = require("chalk");
const app = require("./app");

const sequelize = require("./config/db");

const createAdmin = require("./config/createAdmin");
const createKitchen = require("./config/createKitchen");
const createPermissions = require("./config/createPermissions");

const PORT = process.env.PORT || 5000;

// Connect Database
sequelize.connectDB();

// Default data create
createAdmin();
createKitchen();
createPermissions();

// Start Server
app.listen(PORT, () => {
  console.log(
    chalk.black.bold.bgBlue(` 🚀 Server running on port ${PORT} `)
  );
});
