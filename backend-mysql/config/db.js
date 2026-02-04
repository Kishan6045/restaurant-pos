// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD, 
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false
//   }
// );

// module.exports = sequelize;








const { Sequelize } = require("sequelize");

// Railway ke default variables use karo
const sequelize = new Sequelize(
  process.env.MYSQLDATABASE || process.env.DB_NAME,
  process.env.MYSQLUSER || process.env.DB_USER,
  process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: process.env.LOG_ENABLED === 'true' ? console.log : false,
  }
);

// Connection test
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = sequelize;