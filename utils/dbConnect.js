const sequelize = require('../config/db.js');

// Connect to the database and log a message to the console
const connectDB = async () => {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully🔥');
  
      // Synchronize the database with the models  without need of dropping the tables
      // User.sync({ alter: true })
      await sequelize.sync();
    } catch (error) {
      console.log(error);
      console.log('Cannot connect to database server');
    }
  };
  
module.exports = connectDB;