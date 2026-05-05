const mongoose = require('mongoose');

/**
 * Crypto Schema
 *
 * Represents a cryptocurrency asset stored in MongoDB.
 * Mirrors the shape used in the MarketData / CryptoRow components:
 *   name, symbol, price, image, change24h
 */
const cryptoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cryptocurrency name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      uppercase: true,
      trim: true,
      maxlength: [10, 'Symbol cannot exceed 10 characters'],
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    image: {
      type: String,
      default: '',
      trim: true,
    },

    change24h: {
      type: Number,
      default: 0,
      comment: 'Percentage price change over the last 24 hours (e.g. 3.75 or -1.2)',
    },
  },
  {
    timestamps: true, // createdAt is used to sort "New Listings"
  }
);

// ─── Index for fast symbol lookups ───────────────────────────────────────────
cryptoSchema.index({ symbol: 1 });

module.exports = mongoose.model('Crypto', cryptoSchema);
