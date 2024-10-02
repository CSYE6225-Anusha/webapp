const bcrypt = require('bcrypt');

// Define the number of salt rounds for hashing
const saltRounds = 10;

const hash = (password) => {
  try {
    // Generate a salt and hash the password
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    console.log(hashedPassword)
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message);
  }
};

module.exports = hash;
