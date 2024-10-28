const client = require('../libs/statsd.js');

const metrics = (req, res, next) => {
    client.increment(`api.${req.originalUrl}.count`);
    const startTime = Date.now(); 

    res.on('finish', () => {
        const duration = Date.now() - startTime; // Calculate duration
        client.timing(`api.${req.originalUrl}.time`, duration); 
    });

    next(); // Proceed to the next middleware or route handler
};

module.exports = metrics;