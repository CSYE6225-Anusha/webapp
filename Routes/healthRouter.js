const express = require('express');
const router = express.Router();
const { healthCheck, methodNotAllowed } = require('../Controller/healthController.js');

router.get('/',healthCheck);
router.all('/',methodNotAllowed);

module.exports = router;