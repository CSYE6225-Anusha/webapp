const express = require('express');
const router = express.Router();
const {validateCreateUser, validateUpdateUser} = require('../middlewares/validateUser.js');
const protect = require('../middlewares/auth.js');
const { createUser, updateUser, getUser } = require('../controllers/userController.js');
const { methodNotAllowed } = require('../controllers/healthController.js');


router.get('/self',protect,getUser);
router.post('/',validateCreateUser,createUser);
router.put('/self',protect,validateUpdateUser,updateUser);
router.all('/self',methodNotAllowed);
router.head('/self',methodNotAllowed);


module.exports = router;