const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: sign a JWT and attach it as an HTTP-only cookie ─────────────────
const signTokenAndSendCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    httpOnly: true,                        // Not accessible from JS — prevents XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',                    // Prevents CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days in ms
  };

  res.cookie('token', token, cookieOptions);
  return token;
};

// ─── Helper: format the user object for API responses ────────────────────────
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  accountType: user.accountType,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /register
//  Creates a new user account.
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, accountType } = req.body;

    // ── Validate required fields ──────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.',
      });
    }

    // ── Check for duplicate email ─────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.',
      });
    }

    // ── Create the user (password hashed by pre-save hook) ────────────────
    const user = await User.create({
      name,
      email,
      password,
      accountType: accountType || 'personal',
    });

    // ── Issue JWT cookie and respond ──────────────────────────────────────
    const token = signTokenAndSendCookie(res, user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Coinbase!',
      token,              // Also returned in body so SPA clients can store it
      user: formatUser(user),
    });
  } catch (error) {
    // Mongoose validation errors (minlength, match, etc.)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }

    console.error('[AuthController] register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /login
//  Authenticates an existing user. Returns JWT in HTTP-only cookie.
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // ── Find user and explicitly include the hashed password ─────────────
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Compare submitted password against stored hash ────────────────────
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Issue JWT cookie and respond ──────────────────────────────────────
    const token = signTokenAndSendCookie(res, user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful. Redirecting to homepage.',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('[AuthController] login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /logout
//  Clears the JWT cookie.
// ─────────────────────────────────────────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = { register, login, logout };
