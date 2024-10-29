const express = require('express');
const router = express.Router();
const { healthCheck, methodNotAllowed } = require('../controllers/healthController.js');
const metrics = require('../utils/metrics.js')

router.head('/',methodNotAllowed);
router.get('/',metrics,healthCheck);
router.all('/',methodNotAllowed);

module.exports = router;