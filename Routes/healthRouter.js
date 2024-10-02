const express = require('express');
const router = express.Router();
const { healthCheck, methodNotAllowed } = require('../controllers/healthController.js');

router.get('/',healthCheck);
router.head('/',methodNotAllowed);
router.all('/',methodNotAllowed);

module.exports = router;