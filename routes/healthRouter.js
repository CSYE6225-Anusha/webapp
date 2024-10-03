const express = require('express');
const router = express.Router();
const { healthCheck, methodNotAllowed } = require('../controllers/healthController.js');

router.head('/',methodNotAllowed);
router.get('/',healthCheck);
router.all('/',methodNotAllowed);

module.exports = router;