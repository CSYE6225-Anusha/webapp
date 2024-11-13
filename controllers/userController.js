// const User = require('../models/user.js');
// const hash = require('../utils/passwordUtils.js');

// const createUser = async(req,res)=>{

//     try {
//         const { first_name, last_name, email } = req.body

//         const newUser = await User.create({
//             first_name,
//             last_name,
//             email,
//             password: hash(req.body.password)
//         });

//         const { password, ...userData } = newUser.dataValues;

//         return res.status(201).json(userData);

//     } catch (error) {
//         console.error("Error creating user:", error);
//         return res.status(400).json({ error: "Failed to create user" });
//     }

// }   

// const updateUser = async (req, res) => {
//     try {
//         const user = req.user;

//         req.body.password = hash(req.body.password);

//         // Update user information in the database
//         await User.update(req.body, { where: { id: user.id } });

//         // // Fetch the updated user information
//         // const updatedUser = await User.findOne({ where: { id: user.id } });

//         // // Exclude the password from the returned data
//         // const { password, ...userData } = updatedUser.dataValues;

//         return res.status(204).send();
//     } catch (error) {
//         console.error("Error updating user:", error);
//         return res.status(400).json({ error: "Failed to update user" });
//     }
// };


// const getUser = async(req,res)=>{
//     try{
//         const user = req.user;
//      // Check if request includes any body by checking if there is any content 
//      const contentType = req.headers['content-type'];
//      const contentLength = req.headers['content-length'];

//      //If there is any content then contentType in the headers will be set to the one which is provided else undefined
//      //Checking if the user passed any request body or any query params
//      if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
//          // Return a 400 Bad Request response if any of the conditions are met
//          return  res.status(400).send();
//      }

//     const userData = await User.findByPk(user.id, {
//         attributes: ['id', 'first_name','last_name', "email", "account_created","account_updated"
//         ] 
//     });
//     return res.status(200).json(userData);
//     }
//     catch(error){
//         return res.status(400).json({ error: "Failed to get user" });
//     }
// }



// module.exports = {createUser, updateUser, getUser}

const User = require('../models/user.js');
const hash = require('../utils/passwordUtils.js');
const logger = require('../libs/logger.js');
const client = require('../libs/statsd.js');
const aws = require("aws-sdk");

const sns = new aws.SNS();

const createUser = async (req, res) => {

    try {
        const { first_name, last_name, email } = req.body;
        
        logger.info("Creating new user");

        const dbStartTime = Date.now();
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hash(req.body.password)
        });
        client.timing('db.createUser.time', Date.now() - dbStartTime); // DB query timing

        const { password, ...userData } = newUser.dataValues;

        const message = JSON.stringify({
            email: newUser.email
        });

         // Publish message to SNS topic
         await sns.publish({
            Message: message,
            TopicArn: process.env.SNS_TOPIC_ARN
        }).promise();

        logger.info(`User created successfully with ID: ${userData.id}`);
        
        return res.status(201).json(userData);
        
    } catch (error) {
        logger.error("Error creating user:", error);
        return res.status(400).json({ error: "Failed to create user" });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = req.user;
        
        logger.info(`Updating user with ID: ${user.id}`);
        
        const dbStartTime = Date.now();
        req.body.password = hash(req.body.password);
        
        await User.update(req.body, { where: { id: user.id } });
        client.timing('db.updateUser.time', Date.now() - dbStartTime); // DB query timing
        
        logger.info(`User updated successfully with ID: ${user.id}`);
        
        return res.status(204).send();
    } catch (error) {
        logger.error("Error updating user:", error);
        return res.status(400).json({ error: "Failed to update user" });
    }
};


const getUser = async (req, res) => {
    try {
        const user = req.user;
        const contentType = req.headers['content-type'];
        const contentLength = req.headers['content-length'];
        
        if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
            logger.error(`Invalid request for user with ID: ${user.id} - Unexpected body or query parameters`);
            return res.status(400).send();
        }

        logger.info(`Fetching user with ID: ${user.id}`);
        
        const dbStartTime = Date.now();
        const userData = await User.findByPk(user.id, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'account_created', 'account_updated']
        });
        client.timing('db.getUser.time', Date.now() - dbStartTime); // DB query timing

        if (!userData) {
            logger.error(`User not found with ID: ${user.id}`);
            return res.status(404).json({ error: "User not found" });
        }

        logger.info(`User data fetched successfully for ID: ${user.id}`);
        
        return res.status(200).json(userData);
        
    } catch (error) {
        logger.error("Error retrieving user:", error);
        return res.status(400).json({ error: "Failed to get user" });
    }
};

const verifyEmail = async(req,res)=>{
    const { email, token } = req.query;

    if (!email || !token) {
        return res.status(400).json({ error: "Email and token are required query parameters." });
    }

    try {
        // Check if the user exists with the given email
        const user = await User.findOne({ where: { email } });

        // If user doesn't exist, return 404
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.verification_token !== token) {
            return res.status(400).json({ error: "Invalid token." });
        }

        if(new Date() > user.verification_expiry){
            return res.status(400).json({error: "Token Expired"});
        }

        user.verification_status = true;
        user.verification_token = null;
        user.verification_expiry = null;

        res.status(200).json({ message: "Email verification successful." });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "An error occurred during email verification." });
    }
    

}

module.exports = { createUser, updateUser, getUser, verifyEmail };
