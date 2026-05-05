const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 *
 * Stores authentication credentials and the account type chosen
 * on the Signup page (personal | business | developer).
 *
 * The password is hashed via a pre-save hook — plain-text passwords
 * are never stored in the database.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in query results by default
    },

    accountType: {
      type: String,
      enum: ['personal', 'business', 'developer'],
      default: 'personal',
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// ─── Pre-save hook: hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified (prevents re-hashing on other updates)
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare submitted password against stored hash ──────────
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
