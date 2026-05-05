const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Profile Routes  —  ALL routes are protected by the `protect` middleware.
 * Unauthenticated requests receive 401; the frontend must redirect to /signin.
 *
 * Base path (mounted in app.js): /
 *
 * GET   /profile  — Retrieve the authenticated user's profile
 * PATCH /profile  — Update name or accountType
 */

router.get('/profile',   protect, getProfile);
router.patch('/profile', protect, updateProfile);

module.exports = router;
