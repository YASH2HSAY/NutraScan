require('dotenv').config();
const connectDB = require('./config/db');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const Product = require('./models/Product');
const normalizeProduct = require('./services/normalizeProduct');
const { rateProduct } = require('./scoring/rate');

// TEMPORARY: read a health profile from the URL until login exists (Day 3).
// Example: ?conditions=diabetes,heart&allergens=en:milk&vegetarian=true
function profileFromQuery(query) {
  // Turn "a,b,c" into ['a','b','c'], or [] if the value is missing
  const split = (v) => (typeof v === 'string' && v ? v.split(',') : []);

  const allowed = ['diabetes', 'hypertension', 'heart', 'weightLoss'];
  const conditions = split(query.conditions).filter((c) => allowed.includes(c));
  const allergens = split(query.allergens).filter((a) => /^en:[a-z-]+$/.test(a));
  const vegetarian = query.vegetarian === 'true';

  // Nothing selected means "not personalised"
  if (!conditions.length && !allergens.length && !vegetarian) return null;
  return { conditions, allergens, vegetarian };
}

app.get('/',(req,res)=> {
    res.json({message: 'Scanwise API is running'});
});

app.get('/api/product/:barcode', async (req, res) => {
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
    const rating = rateProduct(product.toObject(), profileFromQuery(req.query));
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