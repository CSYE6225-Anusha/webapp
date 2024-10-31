const express = require('express');
const router = express.Router();
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validateUser.js');
const protect = require('../middlewares/auth.js');
const { createUser, updateUser, getUser } = require('../controllers/userController.js');
const { methodNotAllowed } = require('../controllers/healthController.js');
const metrics = require('../utils/metrics.js');
const multer = require('multer');
const { insertPic, getPic, deletePic } = require('../controllers/profilePicController.js');
const { validateGetNDeletePic, validatePostPic } = require('../middlewares/validatePic.js');
const logger = require('../libs/logger.js');

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to set headers for all routes in this router
router.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache');  // Set Cache-Control header for all routes
    next();  // Proceed to the next middleware or route handler
});

router.head('/', methodNotAllowed);
router.options('/', methodNotAllowed);

router.post('/', metrics, validateCreateUser, createUser);

router.all('/', methodNotAllowed);

router.head('/self', methodNotAllowed);
router.options('/self', methodNotAllowed);
router.get('/self', metrics, protect, getUser);
router.put('/self', metrics, protect, validateUpdateUser, updateUser);
router.all('/self', methodNotAllowed);

router.head('/self/pic', methodNotAllowed);
router.options('/self/pic', methodNotAllowed);
router.post('/self/pic', metrics, (req, res, next) => {
    upload.single('profilePic')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            logger.error("Multer error:", err); 
            return res.status(400).json();
        } else if (err) {
            logger.error("Unexpected error:", err); 
            return res.status(400).json();
        }

        // Check if req.file exists and matches the field name 'profilePic'
        if (!req.file || req.file.fieldname !== 'profilePic') {
            logger.warn("Invalid field name or missing file"); 
            return res.status(400).json();
        }

        logger.info("File uploaded successfully"); 
        return next();
    });
}, validatePostPic, protect, insertPic);

router.delete('/self/pic', metrics, validateGetNDeletePic, protect, deletePic);
router.get('/self/pic', metrics, validateGetNDeletePic, protect, getPic);
router.all('/self/pic', methodNotAllowed);

module.exports = router;
