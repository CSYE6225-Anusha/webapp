const User = require('../models/user.js');
const client = require('../libs/statsd.js');
const logger = require('../libs/logger.js');

const validateUser = (isUpdate = false) => async (req, res, next) => {
    const { first_name, last_name, email, password } = req.body;

    const allowedFields = ['first_name', 'last_name', 'email', 'password'];
    const receivedFields = Object.keys(req.body);
    const hasExtraFields = receivedFields.some(field => !allowedFields.includes(field));
    const contentType = req.headers['content-type'];

    try {
        logger.info(`Starting validation for ${isUpdate ? 'update' : 'create'} user request`);

        if (Object.keys(req.query).length !== 0) {
            logger.error("Invalid request: unexpected query parameters found");
            return res.status(400).send();
        }

        if (contentType !== 'application/json') {
            logger.error("Invalid request: content type must be 'application/json'");
            return res.status(400).send();
        }

        if (hasExtraFields) {
            logger.error("Invalid request: extra fields found in request body");
            return res.status(400).send();
        }

        if (!first_name || !last_name || !email || !password) {
            logger.error("Invalid request: missing required fields");
            return res.status(400).send();
        }

        // Check if user already exists (only for createUser)
        if (!isUpdate) {
            let userExists;
            const start = Date.now();
            try {
                userExists = await User.findOne({ where: { email } });
                const duration = Date.now() - start;
                client.timing('db.query.user_check_exists', duration);
                if (userExists) {
                    logger.error("User creation failed: email already exists");
                    return res.status(400).send();
                }
            } catch (error) {
                logger.error("Database error during user existence check:", error);
                return res.status(503).send();
            }
        }

        // Validate First Name
        if (first_name) {
            if (first_name.length < 3 || first_name.length > 20 || !/^[A-Za-z]+$/.test(first_name)) {
                logger.error("Invalid request: first name validation failed");
                return res.status(400).send();
            }
        }

        // Validate Last Name
        if (last_name) {
            if (last_name.length < 3 || last_name.length > 20 || !/^[A-Za-z]+$/.test(last_name)) {
                logger.error("Invalid request: last name validation failed");
                return res.status(400).send();
            }
        }

        // Validate Email
        if (email) {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
            if (!emailRegex.test(email)) {
                logger.error("Invalid request: email validation failed");
                return res.status(400).send();
            }
        }

        // Validate Password
        if (password) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
            if (password.length < 8 || !passwordRegex.test(password)) {
                logger.error("Invalid request: password validation failed");
                return res.status(400).send();
            }
        }

        // Additional validation for update
        if (isUpdate) {
            const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8').split(':');
            const authEmail = credentials[0];
            if (authEmail !== email) {
                logger.error("Invalid request: authenticated email does not match provided email for update");
                return res.status(400).send();
            }
        }

        logger.info(`Validation successful for ${isUpdate ? 'update' : 'create'} user request`);
        next();
    } catch (error) {
        logger.error("Unexpected error during user validation:", error);
        return res.status(500).json();
    }    
};

// Export the functions for create and update
module.exports = {
    validateCreateUser: validateUser(false),  // For create user
    validateUpdateUser: validateUser(true),   // For update user
};
