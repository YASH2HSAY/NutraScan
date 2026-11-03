require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env');
  process.exit(1);
}
const connectDB = require('./config/db');
const express = require('express');
const app = express();
app.use(express.json());                                 // read JSON request bodies
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/profile', require('./routes/profile'));
app.use('/api/history', require('./routes/history'));         // mount the auth routes
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

    // 3. Rate it (personalised only if a profile was sent)
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