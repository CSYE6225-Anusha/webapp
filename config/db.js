const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const config = require('../config/config.js');
// Load environment variables from .env file
dotenv.config();
const env = process.env.NODE_ENV || 'development';

const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect
});

module.exports = sequelize;