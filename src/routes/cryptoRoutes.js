const express = require('express');
const router = express.Router();
const {
  getAllCrypto,
  getTopGainers,
  getNewListings,
  addCrypto,
} = require('../controllers/cryptoController');

/**
 * Crypto Routes
 * Base path (mounted in app.js): /crypto
 *
 * GET  /crypto          — All cryptocurrencies (sorted by price desc)
 * GET  /crypto/gainers  — Top gainers (sorted by 24h change desc)
 * GET  /crypto/new      — New listings (sorted by createdAt desc)
 * POST /crypto          — Add a new cryptocurrency
 *
 * ⚠️  /gainers and /new MUST be declared before /:id (if ever added)
 *    to prevent Express from treating them as id params.
 */

router.get('/gainers', getTopGainers);
router.get('/new',     getNewListings);
router.get('/',        getAllCrypto);
router.post('/',       addCrypto);

module.exports = router;
