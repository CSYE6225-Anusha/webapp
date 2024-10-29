// const bcrypt = require('bcrypt');
// const User = require('../models/user.js');
// const client = require('../libs/statsd.js');

// const protect = async(req, res, next) => {
//     try{
//   // 1. Check for Authorization header

//   if (!req.headers.authorization) {
//     return res.status(401).send();
//   }

//   const authorizationType = req.headers.authorization.split(' ')[0];
//   if (authorizationType === 'Basic') {
//     // 2. Extract credentials (username and password)
//   const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8').split(':');

//   if (credentials.length !== 2) {
//     return res.status(401).send();
//   }

//   const email = credentials[0];
//   const password = credentials[1];

//   // 3. Find user by email
//   let user;
//   const start = Date.now();
//   try {
//     user = await User.findOne({ where: { email } });
//     const duration = Date.now() - start;
//     client.timing('db.query.user_lookup', duration);
//   } catch (error) {
//     return res.status(503).send();
//   }
    
//     if (!user) {
//       return res.status(401).send();
//     }

//     // 4. Compare password with stored hash
//     const isMatch = bcrypt.compareSync(password, user.password);

//     console.log(isMatch)
//     if (!isMatch) {
//       return res.status(401).send();
//     }

//     // 5. User authenticated, attach to request object
//     req.user = user;
//     next();
//     }
//     if (authorizationType != 'Basic') {
//         return res.status(401).send();
//     }

//   } catch (error) {
//     console.error(error);
//     return res.status(400).send();
//   }
// };

// module.exports = protect;

const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const client = require('../libs/statsd.js');
const logger = require('../libs/logger.js');

const protect = async (req, res, next) => {
  try {
    logger.info('Authorization header check initiated');

    // 1. Check for Authorization header
    if (!req.headers.authorization) {
      logger.warn('Authorization header missing');
      return res.status(401).send();
    }

    const authorizationType = req.headers.authorization.split(' ')[0];
    if (authorizationType === 'Basic') {
      // 2. Extract credentials (username and password)
      const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8').split(':');

      if (credentials.length !== 2) {
        logger.warn('Invalid credentials format in Authorization header');
        return res.status(401).send();
      }

      const email = credentials[0];
      const password = credentials[1];

      // 3. Find user by email
      logger.info(`Looking up user by email: ${email}`);
      let user;
      const start = Date.now();
      try {
        user = await User.findOne({ where: { email } });
        const duration = Date.now() - start;
        client.timing('db.query.user_lookup', duration);
        logger.info(`User lookup completed for email: ${email} in ${duration}ms`);
      } catch (error) {
        logger.error(`Database error during user lookup for email: ${email}`, error);
        return res.status(503).send();
      }

      if (!user) {
        logger.warn(`User not found for email: ${email}`);
        return res.status(401).send();
      }

      // 4. Compare password with stored hash
      logger.info('Comparing provided password with stored hash');
      const isMatch = bcrypt.compareSync(password, user.password);

      if (!isMatch) {
        logger.warn('Password mismatch');
        return res.status(401).send();
      }

      // 5. User authenticated, attach to request object
      logger.info(`User authenticated successfully for email: ${email}`);
      req.user = user;
      return next();
    }

    logger.warn(`Unsupported authorization type: ${authorizationType}`);
    return res.status(401).send();

  } catch (error) {
    logger.error('Unexpected error in authentication middleware', error);
    return res.status(400).send();
  }
};

module.exports = protect;
