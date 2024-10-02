const { updateUser } = require('../controllers/userController.js');
const User = require('../models/user.js');

const validateUser = (isUpdate = false) => async (req, res, next) => {
    const { first_name, last_name, email, password } = req.body;

    const allowedFields = ['first_name', 'last_name', 'email', 'password'];
    const receivedFields = Object.keys(req.body);
    const hasExtraFields = receivedFields.some(field => !allowedFields.includes(field));
    
    try {
        if (hasExtraFields) {
            return res.status(400).json({ error: "Invalid fields in the request body" });
        }
    
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "Required fields are missing" });
        }
    
        // Check if user already exists (only for createUser)
        if (!isUpdate) {
            const userExists = await User.findOne({ where: { email: email } });
            if (userExists) {
                return res.status(400).json({ error: "User already exists" });
            }
        }
    
        // Validate First Name (required for create, optional for update)
        if (first_name) {
            if (first_name.length < 3) {
                return res.status(400).json({ error: "First name must be at least 3 characters long" });
            } else if (first_name.length > 20) {
                return res.status(400).json({ error: "First name cannot exceed 20 characters" });
            } else if (!/^[A-Za-z]+$/.test(first_name)) {
                return res.status(400).json({ error: "First name should only contain alphabets" });
            }
        }
    
        // Validate Last Name (required for create, optional for update)
        if (last_name) {
            if (last_name.length < 3) {
                return res.status(400).json({ error: "Last name must be at least 3 characters long" });
            } else if (last_name.length > 20) {
                return res.status(400).json({ error: "Last name cannot exceed 20 characters" });
            } else if (!/^[A-Za-z]+$/.test(last_name)) {
                return res.status(400).json({ error: "Last name should only contain alphabets" });
            }
        }
    
        // Validate Email (required for create, optional for update)
        if (email) {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Email format is invalid" });
            }
        }
    
        // Validate Password (required for create and update)
        if (password) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
            if (password.length < 8) {
                return res.status(400).json({ error: "Password must be at least 8 characters long" });
            } else if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    error: "Password must contain at least one alphabet, one number, and one special character",
                });
            }
        }
    
        // Additional validation for update
        if (isUpdate) {
            const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8').split(':');
            const authEmail = credentials[0];
            if (authEmail !== email) {
                return res.status(403).json({ error: "You cannot modify email address" });
            }
        }
    
        next();
    } catch (error) {
        return res.status(500).json({ error: "An error occurred during validation"});
    }    
};

// Export the functions for create and update
module.exports = {
    validateCreateUser: validateUser(false),  // For create user
    validateUpdateUser: validateUser(true),   // For update user
};
