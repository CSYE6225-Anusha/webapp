const logger = require('../libs/logger.js');

const validateGetNDeletePic = async (req, res, next) => {
    logger.info('Starting validation for GET or DELETE request without body or query parameters');

    // Check if request includes any body or query parameters
    const contentType = req.headers['content-type'];
    const contentLength = req.headers['content-length'];

    if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
        logger.error("Invalid request: body or query parameters are not allowed for this endpoint");
        return res.status(400).send();
    }

    logger.info('Validation successful for GET or DELETE request with no body or query parameters');
    next();
}

const validatePostPic = async (req, res, next) => {
    logger.info('Starting validation for POST request with file upload');

    const contentType = req.headers['content-type'];

    // Check if content type is 'multipart/form-data'
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
        logger.error("Invalid request: content type must be 'multipart/form-data'");
        return res.status(400).send();
    }

    // Ensure file is provided
    if (!req.file) {
        logger.error("Invalid request: 'profilePic' file must be provided");
        return res.status(400).send();
    }

    // Check if the file format is one of the allowed image formats.
    const file = req.file;
    const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedFormats.includes(file.mimetype)) {
        logger.error(`Invalid request: unsupported image format (${file.mimetype})`);
        return res.status(400).send();
    }

    if(Object.keys(req.query).length !== 0){
        logger.error('Query params not allowed for upload pic');
        return res.status(400).send();
    }

    logger.info('Validation successful for POST request with a valid file upload');
    next();
};

module.exports = { validateGetNDeletePic, validatePostPic };
