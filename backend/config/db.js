const mongoose = require("mongoose");
const chalk = require("chalk");     // console me color full kar ne ke liye

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(chalk.black.bold.bgGreen(" ✔ MongoDB Connected Successfully ")
        );
    } catch (error) {
        console.log(chalk.white.bold.bgRed(" ✖ MongoDB Connection Failed "));
        console.log(chalk.red(error.message));
        process.exit(1);
    }
};

module.exports = connectDB;