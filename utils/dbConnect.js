const sequelize = require('../config/db.js');

// Connect to the database and log a message to the console
const connectDB = async () => {
    try {
      await sequelize.authenticate();
      // Synchronize the database with the models  without need of dropping the tables
      // User.sync({ alter: true })
      await sequelize.sync();
      return true;
    } catch (error) {
      return false;
    }
};
  
module.exports = connectDB;