const { updateUser } = require('../controllers/userController.js');
const User = require('../models/user.js');
const client = require('../libs/statsd.js');


const validateUser = (isUpdate = false) => async (req, res, next) => {
    const { first_name, last_name, email, password } = req.body;

    const allowedFields = ['first_name', 'last_name', 'email', 'password'];
    const receivedFields = Object.keys(req.body);
    const hasExtraFields = receivedFields.some(field => !allowedFields.includes(field));
    const contentType = req.headers['content-type'];

    
    try {
        if(Object.keys(req.query).length !== 0){
            return res.status(400).send();
        }

        if(contentType != 'application/json'){
            return res.status(400).send();
        }

        if (hasExtraFields) {
            return res.status(400).send();
        }
    
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).send();
        }
    
        // Check if user already exists (only for createUser)
        if (!isUpdate) {
            let userExists;
            const start = Date.now();
            try {
                userExists = await User.findOne({ where: { email: email } });
                const duration = Date.now() - start;
                client.timing('db.query.user_check_exists', duration);
                if (userExists) {
                    return res.status(400).send();
                }
            } catch (error) {
                console.log(error)

                return res.status(503).send();
            }
        }
    
        // Validate First Name 
        if (first_name) {
            if (first_name.length < 3) {
                return res.status(400).send();
            } else if (first_name.length > 20) {
                return res.status(400).send();
            } else if (!/^[A-Za-z]+$/.test(first_name)) {
                return res.status(400).send();
            }
        }
    
        // Validate Last Name 
        if (last_name) {
            if (last_name.length < 3) {
                return res.status(400).send();
            } else if (last_name.length > 20) {
                return res.status(400).send();
            } else if (!/^[A-Za-z]+$/.test(last_name)) {
                return res.status(400).send();
            }
        }
    
        // Validate Email 
        if (email) {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).send();
            }
        }
    
        // Validate Password 
        if (password) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
            if (password.length < 8) {
                return res.status(400).send();
            } else if (!passwordRegex.test(password)) {
                return res.status(400).send();
            }
        }
    
        // Additional validation for update
        if (isUpdate) {
            const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8').split(':');
            const authEmail = credentials[0];
            if (authEmail !== email) {
                return res.status(400).send();
            }
        }
    
        next();
    } catch (error) {
        return res.status(500).json();
    }    
};

// Export the functions for create and update
module.exports = {
    validateCreateUser: validateUser(false),  // For create user
    validateUpdateUser: validateUser(true),   // For update user
};
