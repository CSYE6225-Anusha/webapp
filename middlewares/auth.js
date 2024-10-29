const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const client = require('../libs/statsd.js');

const protect = async(req, res, next) => {
    try{
  // 1. Check for Authorization header
  console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    return res.status(401).send();
  }

  const authorizationType = req.headers.authorization.split(' ')[0];
  if (authorizationType === 'Basic') {
    // 2. Extract credentials (username and password)
  const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8').split(':');

  if (credentials.length !== 2) {
    return res.status(401).send();
  }

  const email = credentials[0];
  const password = credentials[1];

  // 3. Find user by email
  let user;
  const start = Date.now();
  try {
    user = await User.findOne({ where: { email } });
    const duration = Date.now() - start;
    client.timing('db.query.user_lookup', duration);
  } catch (error) {
    return res.status(503).send();
  }
    
    if (!user) {
      return res.status(401).send();
    }

    // 4. Compare password with stored hash
    const isMatch = bcrypt.compareSync(password, user.password);

    console.log(isMatch)
    if (!isMatch) {
      return res.status(401).send();
    }

    // 5. User authenticated, attach to request object
    req.user = user;
    next();
    }
    if (authorizationType != 'Basic') {
        return res.status(401).send();
    }

  } catch (error) {
    console.error(error);
    return res.status(400).send();
  }
};

module.exports = protect;