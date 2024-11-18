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
const Email = require('../models/email.js');
const hash = require('../utils/passwordUtils.js');
const logger = require('../libs/logger.js');
const client = require('../libs/statsd.js');
const aws = require("aws-sdk");
const dotenv = require('dotenv');
const { v4: uuidv4 } = require("uuid");

dotenv.config();
aws.config.update({ region: process.env.AWS_REGION });
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
        const verificationToken = uuidv4();

        const message = JSON.stringify({
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            verificationToken: verificationToken
        });

        await User.update(
            {
              verification_token: verificationToken,
              verification_expiry: new Date(Date.now() + 2 * 60 * 1000),
            },
            { where: { email: newUser.email } }
          );

         // Publish message to SNS topic
         await sns.publish({
            Message: message,
            TopicArn: process.env.SNS_TOPIC_ARN
        }).promise();

        logger.info(`User created successfully with ID: ${userData.id}`);
        
        res.status(201).json({
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            account_created: userData.account_created,
            account_updated: userData.account_updated
        });
        
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

const verifyEmail = async (req, res) => {
    const { email, token } = req.query;

    if (!email || !token) {
        logger.error("Missing email or token in query parameters.");
        return res.status(400).json({ error: "Email and token are required query parameters." });
    }

    try {
        logger.info(`Email verification initiated for email: ${email}`);
        
        // DB query start time
        const dbStartTime = Date.now();
        const user = await User.findOne({ where: { email } });
        client.timing('db.verifyEmail.findUser.time', Date.now() - dbStartTime);
        
        if (!user) {
            logger.error(`User not found for email: ${email}`);
            return res.status(404).json({ error: "User not found." });
        }

        if (user.verification_status === true) {
            logger.info(`Email already verified for email: ${email}`);
            return res.status(200).json({ message: "Email verification is successful." });
        }

        if (user.verification_token !== token) {
            logger.error(`Invalid token provided for email: ${email}`);
            return res.status(400).json({ error: "Invalid token." });
        }

        if (new Date() > user.verification_expiry) {
            logger.error(`Verification token expired for email: ${email}`);
            return res.status(400).json({ error: "Token expired." });
        }

        // Update user status
        const updateStartTime = Date.now();
        await User.update(
            {
                verification_status: true,
                verification_token: null,
                verification_expiry: null,
            },
            { where: { email } }
        );
        client.timing('db.verifyEmail.updateUser.time', Date.now() - updateStartTime);
        
        logger.info(`Email verification successful for email: ${email}`);
        return res.status(200).json({ message: "Email verification is successful." });

    } catch (error) {
        logger.error(`Verification error for email: ${email}`, error);
        return res.status(500).json({ error: "An error occurred during email verification." });
    }
};


module.exports = { createUser, updateUser, getUser, verifyEmail };
