/**
 * Manual: assign IST businessDay + displayOrderNumber to legacy orders.
 * Usage: from backend folder, `npm run migrate:order-numbers`
 */
require("dotenv").config();
const mongoose = require("mongoose");
const assignMissingOrderNumbers = require("../services/assignMissingOrderNumbers");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => assignMissingOrderNumbers())
  .then((n) => {
    console.log(`Done. Updated ${n} order(s).`);
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
