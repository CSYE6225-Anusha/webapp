const checkDBConnection = require('../utils/dbConnect.js');

const dbConnectivity = async (req, res, next) => {
    const isDBConnected = await checkDBConnection();
    if (!isDBConnected) {
        return res.status(503).send();
    }
    next();
}

module.exports = dbConnectivity;