const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 *
 * Express middleware that verifies a JWT and attaches the authenticated
 * user to req.user. The token is read from:
 *   1. An HTTP-only cookie named "token"  (preferred — set at login)
 *   2. The Authorization header (Bearer <token>)  (useful for API clients)
 *
 * Returns 401 if no token is present or the token is invalid/expired.
 * Returns 404 if the token is valid but the user no longer exists.
 */
const protect = async (req, res, next) => {
  let token;

  // ── 1. Cookie-based (HTTP-only) ───────────────────────────────────────────
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // ── 2. Authorization header fallback ─────────────────────────────────────
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user (minus the password) to the request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = { protect };
