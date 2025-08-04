// middleware/decodeJWT.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function decodeJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return next(); // No token? Skip and continue
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.account = decoded;           // ✅ Match what your controller expects
    res.locals.user = decoded;  
    console.log("JWT cookie:", req.cookies.jwt);
     // ✅ Match what EJS templates use
    console.log("✅ Decoded JWT:", decoded);
  } catch (error) {
    console.warn("⚠️ Invalid JWT:", error.message);
  }

  next(); // Always call next()
}

module.exports = decodeJWT;
