const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT and check account type
const authMiddleware = (requiredTypes = ['Admin', 'Employee']) => {
  return async (req, res, next) => {
    try {
      // 1. Check for token in cookies
      const token = req.cookies.jwt;
      if (!token) {
        throw new Error('Not authorized');
      }

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Check account type
      if (!requiredTypes.includes(decoded.account_type)) {
        throw new Error('Insufficient privileges');
      }

      // 4. Attach user data to request
      req.user = decoded;
      
      // 5. Make user data available to views
      res.locals.user = decoded;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      req.flash('error', 'Please login with proper credentials to access this page');
      res.redirect('/account/management');
    }
  };
};

module.exports = authMiddleware;