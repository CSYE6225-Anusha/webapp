const User = require('../models/user.js');
const hash = require('../utils/passwordUtils.js');
const checkDBConnection = require('../utils/dbConnect.js')

const createUser = async(req,res)=>{

    try {
        await checkDBConnection(res);
        const { first_name, last_name, email } = req.body

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hash(req.body.password)
        });

        const { password, ...userData } = newUser.dataValues;

        return res.status(201).json(userData);

    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(400).json({ error: "Failed to create user" });
    }

}   

const updateUser = async (req, res) => {
    try {
        await checkDBConnection(res);
        const user = req.user;

        req.body.password = hash(req.body.password);

        // Update user information in the database
        await User.update(req.body, { where: { id: user.id } });

        // // Fetch the updated user information
        // const updatedUser = await User.findOne({ where: { id: user.id } });

        // // Exclude the password from the returned data
        // const { password, ...userData } = updatedUser.dataValues;

        return res.status(204).send();
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(400).json({ error: "Failed to update user" });
    }
};


const getUser = async(req,res)=>{
    try{
        await checkDBConnection(res);
        const user = req.user;
     // Check if request includes any body by checking if there is any content 
     const contentType = req.headers['content-type'];
     const contentLength = req.headers['content-length'];

     //If there is any content then contentType in the headers will be set to the one which is provided else undefined
     //Checking if the user passed any request body or any query params
     if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
         // Return a 400 Bad Request response if any of the conditions are met
         return  res.status(400).send();
     }

    const userData = await User.findByPk(user.id, {
        attributes: ['id', 'first_name','last_name', "email", "account_created","account_updated"
        ] 
    });
    return res.status(200).json(userData);
    }
    catch(error){
        return res.status(400).json({ error: "Failed to get user" });
    }
}



module.exports = {createUser, updateUser, getUser}