require("dotenv").config();
const chalk = require("chalk");    // consosle color dene ke liye
const app = require("./app");
const connectDB = require("./config/db");

const createAdmin = require("./config/createAdmin");   // admin default create kar raha hai
const createKitchen = require("./config/createKitchen")    // default create kitchen ke liye
const createPermissions = require("./config/createPermissions"); // default create permissions

const PORT = process.env.PORT || 5000;




//connect database
connectDB();

// admin create database 
createAdmin();

// kitchen create
createKitchen();

// permissions create
createPermissions();


//start server
app.listen(PORT,() => {
    console.log(chalk.black.bold.bgBlue(` 🚀 Server running on port ${PORT} `)
);
});