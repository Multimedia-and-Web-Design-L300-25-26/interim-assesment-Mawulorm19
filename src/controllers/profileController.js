// ─────────────────────────────────────────────────────────────────────────────
//  Profile Controller
//
//  All routes here are protected by the `protect` middleware, so
//  req.user is always a fully-populated User document.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  GET /profile
//  Returns the authenticated user's profile data.
// ─────────────────────────────────────────────────────────────────────────────
const getProfile = (req, res) => {
  const { _id, name, email, accountType, createdAt, updatedAt } = req.user;

  return res.status(200).json({
    success: true,
    message: 'Profile fetched successfully.',
    user: {
      id: _id,
      name,
      email,
      accountType,
      createdAt,
      updatedAt,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /profile
//  Allows the authenticated user to update their name or accountType.
//  Email and password updates intentionally require separate, dedicated flows.
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, accountType } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (accountType) {
      const validTypes = ['personal', 'business', 'developer'];
      if (!validTypes.includes(accountType)) {
        return res.status(400).json({
          success: false,
          message: `accountType must be one of: ${validTypes.join(', ')}.`,
        });
      }
      user.accountType = accountType;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }

    console.error('[ProfileController] updateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

module.exports = { getProfile, updateProfile };
