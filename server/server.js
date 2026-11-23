require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env');
  process.exit(1);
}
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const express = require('express');
const app = express();
app.use(helmet());                                       // safe security headers

// Allow only our own frontend to call this API from a browser
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));

app.use(express.json({ limit: '10kb' }));                // read JSON bodies, reject huge ones

// General limit: 300 requests per 15 minutes per client
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,           // tell the client its remaining quota
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Strict limit for signup and login: 20 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/profile', require('./routes/profile'));
app.use('/api/history', require('./routes/history'));         
const PORT = process.env.PORT || 5000;
const Product = require('./models/Product');
const normalizeProduct = require('./services/normalizeProduct');
const { rateProduct } = require('./scoring/rate');
const { optionalAuth } = require('./middleware/auth');
const User = require('./models/User');
const ScanHistory = require('./models/ScanHistory');




app.get('/',(req,res)=> {
    res.json({message: 'Scanwise API is running'});
});

app.get('/api/product/:barcode', optionalAuth, async (req, res) => {
  const { barcode } = req.params;

  if (!/^\d{8,14}$/.test(barcode)) {
    return res.status(400).json({ error: 'Invalid barcode. Use 8 to 14 digits.' });
  }

  try {
    let source = 'cache';
    let product = await Product.findOne({ barcode });       // 1. try our database

    if (!product) {                                         // 2. not cached: ask Open Food Facts
      source = 'openfoodfacts';
      const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Scanwise/1.0 (final year project)' },
        signal: AbortSignal.timeout(8000),
      });
      const data = await response.json();

      if (data.status !== 1) {
        return res.status(404).json({ error: 'Product not found' });
      }
      product = await Product.create(normalizeProduct(data.product, barcode));
    }

    
        // Load the logged-in user's saved profile (null if anonymous)
    let profile = null;
    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user) profile = user.toObject().healthProfile;
    }

    const rating = rateProduct(product.toObject(), profile);

    // Save to history for logged-in users; a failure here must not break the lookup
    if (profile) {
      try {
        await ScanHistory.create({
          userId: req.userId,
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          imageUrl: product.imageUrl,
          score: rating.final.score,
          band: rating.final.band,
          safetyLevel: rating.safety ? rating.safety.level : null,
        });
      } catch (error) {
        console.error('Could not save history:', error.message);
      }
    }
    res.json({ source, product, rating });
  } catch (error) {
    console.error('Product lookup error:', error.message, '| cause:', error.cause);
    res.status(502).json({ error: 'Could not reach Open Food Facts' });
  }
});

connectDB();
app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
});