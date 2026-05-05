require('dotenv').config();

const express    = require('express');
const mongoose = require('mongoose');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const connectDB  = require('./config/db');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const cryptoRoutes  = require('./routes/cryptoRoutes');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
//  Global Middleware
// ─────────────────────────────────────────────────────────────────────────────

// CORS — allow the React dev server (and any additional origins in .env)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl) in development
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" is not allowed.`));
      }
    },
    credentials: true, // Required so the browser sends/receives cookies
  })
);

app.use(express.json());              // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form-encoded bodies
app.use(cookieParser());              // Parse cookies (for JWT)

// ─────────────────────────────────────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────────────────────────────────────

app.use('/',       authRoutes);       // POST /register  POST /login  POST /logout
app.use('/',       profileRoutes);    // GET  /profile   PATCH /profile
app.use('/crypto', cryptoRoutes);     // GET  /crypto    GET /crypto/gainers  …

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.status(200).json({ success: true, status: 'API is running 🚀' })
);

// ─────────────────────────────────────────────────────────────────────────────
//  404 handler — catch any unregistered route
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  Global error handler
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Global Error Handler]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred.',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  Start server
// ─────────────────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    app.listen(process.env.PORT || 5001, '0.0.0.0', () => {
      console.log("Server is up!");
    });
  } catch (error) {
    console.error("FATAL ERROR DURING STARTUP:", error.message);
    process.exit(1); // This forces the error into the Render logs
  }
}

startServer();
