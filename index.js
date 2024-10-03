const app = require('./app.js')
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Get the port number from the environment variables
const PORT = process.env.PORT;

// Start the Express server on the specified port
app.listen(PORT);