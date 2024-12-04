const express = require('express');
const bodyParser = require("body-parser");
const errorHandler = require('./middlewares/errorHandler.js')
// Create a new Express application instance
const app = express();

// Import the  routers
const healthRouter = require('./routes/healthRouter.js');
const userRouter = require('./routes/userRouter.js')

// Use body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(errorHandler);


// Route for healthz endpoint
app.use('/healthz', healthRouter);

app.use('/cicd', healthRouter);

//Route for  user endpoint
app.use('/v1/user', userRouter );

// For all other end points 
app.use('*', (req, res) => {
    // Set Cache-Control header to prevent caching
    res.set('Cache-Control', 'no-cache');

    // Return a 404 Not Found response
    res.status(404).send();
});

module.exports = app;