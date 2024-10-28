const express = require('express');
const router = express.Router();
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validateUser.js');
const protect = require('../middlewares/auth.js');
const { createUser, updateUser, getUser } = require('../controllers/userController.js');
const { methodNotAllowed } = require('../controllers/healthController.js');
const metrics = require('../utils/metrics.js');

// Middleware to set headers for all routes in this router
router.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache');  // Set Cache-Control header for all routes
    next();  // Proceed to the next middleware or route handler
});

router.head('/', methodNotAllowed);
router.options('/', methodNotAllowed);

router.post('/',metrics, validateCreateUser, createUser);

router.all('/', methodNotAllowed);

router.head('/self', methodNotAllowed);
router.options('/self', methodNotAllowed);
router.get('/self', metrics,protect, getUser);
router.put('/self', metrics,protect, validateUpdateUser, updateUser);
router.all('/self',methodNotAllowed);

module.exports = router;
