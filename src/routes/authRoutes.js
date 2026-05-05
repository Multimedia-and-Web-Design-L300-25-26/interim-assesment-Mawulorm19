const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

/**
 * Auth Routes
 * Base path (mounted in app.js): /
 *
 * POST  /register  — Create a new account
 * POST  /login     — Authenticate and receive JWT cookie
 * POST  /logout    — Clear the JWT cookie
 *
 * Note: The spec listed these as GET routes, but POST is the correct
 * HTTP verb for actions that create resources or authenticate users.
 * GET should never carry a request body with sensitive credentials.
 */

router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);

module.exports = router;
