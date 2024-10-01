const app = require('./app.js')
const dotenv = require('dotenv');
const dbConnect = require('./utils/dbConnect.js')

// Load environment variables from .env file
dotenv.config();

// Get the port number from the environment variables
const PORT = process.env.PORT;
dbConnect();
// Start the Express server on the specified port
app.listen(PORT);