

const validateGetNDeletePic = async (req, res, next) =>{
     // Check if request includes any body by checking if there is any content 
     const contentType = req.headers['content-type'];
     const contentLength = req.headers['content-length'];

     // If there is any content then contentType in the headers will be set to the one which is provided else undefined
     // Checking if the user passed any request body or any query params
     if (contentLength !== undefined || contentType !== undefined || Object.keys(req.query).length !== 0) {
         logger.error("Invalid request: unexpected body or query parameters");
         return res.status(400).send();
     }
     next();
}

const validatePostPic = async (req, res, next) => {
    const contentType = req.headers['content-type'];

    // Check if content type is 'multipart/form-data'
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
        logger.error("Invalid request: only multipart/form-data content type is allowed");
        return res.status(400).send();
    }

    // Ensure only one file is provided
    const files = req.files;
    if (!files || Object.keys(files).length !== 1) {
        logger.error("Invalid request: exactly one file must be provided");
        return res.status(400).send();
    }

    // Check if the file key is 'profilePic'
    if (!files.profilePic) {
        logger.error("Invalid request: file key must be 'profilePic'");
        return res.status(400).send();
    }

    // Check if the file format is one of the allowed image formats
    const file = files.profilePic;
    const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedFormats.includes(file.mimetype)) {
        logger.error("Invalid request: unsupported image format");
        return res.status(400).send();
    }

    next();
};

module.exports = { validateGetNDeletePic, validatePostPic };
