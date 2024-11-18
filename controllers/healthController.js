// const sequelize = require('../config/db.js');
// const dotenv = require('dotenv');

// // Load environment variables from .env file
// dotenv.config();

// // The below method is triggered when there is a get call
// const healthCheck = async (req, res) => {
//     try {
//         // Set Cache-Control header to prevent caching
//         res.set('Cache-Control', 'no-cache');

//         // Authenticate with the database
//         await sequelize.authenticate();

//         // Check if request includes any body by checking if there is any content 
//         const contentType = req.headers['content-type'];
//         const contentLength = req.headers['content-length'];

//         //If there is any content then contentType in the headers will be set to the one which is provided else undefined
//         //Checking if the user passed any request body or any query params
//         if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
//             // Return a 400 Bad Request response if any of the conditions are met
//             return res.status(400).send();
//         }

//         // Return a 200 OK response indicating successful health check
//         res.status(200).send();
//     } catch (error) {
//         // Set Cache-Control header to prevent caching in case of an error
//         res.set('Cache-Control', 'no-cache');

//         // Return a 503 Service Unavailable response if database authentication fails
//         res.status(503).send();
//     }
// };

// // The below method is triggered for all calls except get call
// const methodNotAllowed = async (req, res) => {
//     // Set Cache-Control header to prevent caching
//     res.set('Cache-Control', 'no-cache');

//     // Return a 405 Method Not Allowed response
//     res.status(405).send();
// };


// module.exports = { healthCheck, methodNotAllowed };


const sequelize = require('../config/db.js');
const dotenv = require('dotenv');
const logger = require('../libs/logger.js');  

// Load environment variables from .env file
dotenv.config();

// The below method is triggered when there is a get call
const healthCheck = async (req, res) => {
    try {
        // Set Cache-Control header to prevent caching
        res.set('Cache-Control', 'no-cache');

        logger.info("Health check initiated");

        // Authenticate with the database
        await sequelize.authenticate();

        // Check if request includes any body by checking if there is any content 
        const contentType = req.headers['content-type'];
        const contentLength = req.headers['content-length'];

        // If there is any content then contentType in the headers will be set to the one which is provided else undefined
        // Checking if the user passed any request body or any query params
        if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
            logger.error("Invalid request for health check: unexpected body or query parameters");
            return res.status(400).send();
        }

        // Return a 200 OK response indicating successful health check
        logger.info("Health check passed");
        res.status(200).json({
            message: "hello"
        });
    } catch (error) {
        // Set Cache-Control header to prevent caching in case of an error
        res.set('Cache-Control', 'no-cache');

        logger.error("Health check failed: database authentication error", error);
        
        // Return a 503 Service Unavailable response if database authentication fails
        res.status(503).send();
    }
};

// The below method is triggered for all calls except get call
const methodNotAllowed = async (req, res) => {
    // Set Cache-Control header to prevent caching
    res.set('Cache-Control', 'no-cache');

    logger.error(`Method not allowed: ${req.method} for URL: ${req.originalUrl}`);

    // Return a 405 Method Not Allowed response
    res.status(405).send();
};

module.exports = { healthCheck, methodNotAllowed };
