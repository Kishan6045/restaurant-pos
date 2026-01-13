require("dotenv").config();
const chalk = require("chalk");    // consosle color dene ke liye
const app = require("./app");
const connectDB = require("./config/db");

const createAdmin = require("./config/createAdmin");   // admin default create kar raha hai
const createKitchen = require("./config/createKitchen")    // default create kitchen ke liye

const PORT = process.env.PORT || 5000;




//connect database
connectDB();

// admin create database 
createAdmin();

// kitchen create
createKitchen();



// //start server
// app.listen(PORT,() => {
//     console.log(chalk.black.bold.bgBlue(` 🚀 Server running on port ${PORT} `)
// );
// });

// Start server only in non-production (local/dev)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(chalk.black.bold.bgBlue(` 🚀 Server running on port ${PORT} `));
    });
}


// Export app for Vercel (serverless)
module.exports = app;