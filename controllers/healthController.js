const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a Sequelize instance to connect to the PostgreSQL database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
});

// The below method is triggered when there is a get call
const healthCheck = async (req, res) => {
    try {
        // Set Cache-Control header to prevent caching
        res.set('Cache-Control', 'no-cache');

        // Authenticate with the database
        await sequelize.authenticate();

        // Check if request includes any body by checking if there is any content 
        const contentType = req.headers['content-type'];
        const contentLength = req.headers['content-length'];

        //If there is any content then contentType in the headers will be set to the one which is provided else undefined
        //Checking if the user passed any request body or any query params
        if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
            // Return a 400 Bad Request response if any of the conditions are met
            return res.status(400).send();
        }

        // Return a 200 OK response indicating successful health check
        res.status(200).send();
    } catch (error) {
        // Set Cache-Control header to prevent caching in case of an error
        res.set('Cache-Control', 'no-cache');

        // Return a 503 Service Unavailable response if database authentication fails
        res.status(503).send();
    }
};

// The below method is triggered for all calls except get call
const methodNotAllowed = async (req, res) => {
    // Set Cache-Control header to prevent caching
    res.set('Cache-Control', 'no-cache');

    // Return a 405 Method Not Allowed response
    res.status(405).send();
};


module.exports = { healthCheck, methodNotAllowed };