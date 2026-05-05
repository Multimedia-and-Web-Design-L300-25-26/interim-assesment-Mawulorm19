const Crypto = require('../models/Crypto');

// ─────────────────────────────────────────────────────────────────────────────
//  GET /crypto
//  Returns all cryptocurrencies, ordered by market-cap proxy (price desc).
// ─────────────────────────────────────────────────────────────────────────────
const getAllCrypto = async (req, res) => {
  try {
    const cryptos = await Crypto.find().sort({ price: -1 });

    return res.status(200).json({
      success: true,
      count: cryptos.length,
      data: cryptos,
    });
  } catch (error) {
    console.error('[CryptoController] getAllCrypto error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cryptocurrencies.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /crypto/gainers
//  Returns cryptos sorted by 24h price change — highest gainers first.
// ─────────────────────────────────────────────────────────────────────────────
const getTopGainers = async (req, res) => {
  try {
    const gainers = await Crypto.find().sort({ change24h: -1 });

    return res.status(200).json({
      success: true,
      count: gainers.length,
      data: gainers,
    });
  } catch (error) {
    console.error('[CryptoController] getTopGainers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching top gainers.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /crypto/new
//  Returns cryptos sorted by date added — newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getNewListings = async (req, res) => {
  try {
    const newListings = await Crypto.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: newListings.length,
      data: newListings,
    });
  } catch (error) {
    console.error('[CryptoController] getNewListings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching new listings.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /crypto
//  Adds a new cryptocurrency to the database.
//
//  Required body fields:
//    name      (string)  — e.g. "Bitcoin"
//    symbol    (string)  — e.g. "BTC"
//    price     (number)  — e.g. 62000.50
//
//  Optional body fields:
//    image     (string)  — URL to the coin's logo
//    change24h (number)  — e.g. 3.75 or -1.2
// ─────────────────────────────────────────────────────────────────────────────
const addCrypto = async (req, res) => {
  try {
    const { name, symbol, price, image, change24h } = req.body;

    // ── Basic validation ───────────────────────────────────────────────────
    if (!name || !symbol || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name, symbol, and price are required fields.',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'price must be a non-negative number.',
      });
    }

    // ── Prevent duplicate symbols ──────────────────────────────────────────
    const existing = await Crypto.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A cryptocurrency with symbol "${symbol.toUpperCase()}" already exists.`,
      });
    }

    // ── Create and save ────────────────────────────────────────────────────
    const crypto = await Crypto.create({
      name,
      symbol,
      price,
      image: image || '',
      change24h: change24h !== undefined ? change24h : 0,
    });

    return res.status(201).json({
      success: true,
      message: `${crypto.name} (${crypto.symbol}) added successfully.`,
      data: crypto,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }

    console.error('[CryptoController] addCrypto error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding cryptocurrency.',
    });
  }
};

module.exports = { getAllCrypto, getTopGainers, getNewListings, addCrypto };
