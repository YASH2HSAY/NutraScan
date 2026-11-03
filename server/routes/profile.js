const express = require('express');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

const CONDITIONS = ['diabetes', 'hypertension', 'heart', 'weightLoss'];
const ALLERGEN_RE = /^en:[a-z-]{2,40}$/;     // e.g. en:milk, en:tree-nuts

// GET /api/profile: my saved health profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    res.json({ email: user.email, healthProfile: user.toObject().healthProfile });
  } catch (error) {
    console.error('Profile read error:', error.message);
    res.status(500).json({ error: 'Could not load the profile.' });
  }
});

// PUT /api/profile: replace my health profile
router.put('/', requireAuth, async (req, res) => {
  const { conditions, allergens, vegetarian } = req.body || {};

  // Validate every field; reject anything unexpected
  if (!Array.isArray(conditions) || !conditions.every((c) => CONDITIONS.includes(c))) {
    return res.status(400).json({ error: `conditions must be a list from: ${CONDITIONS.join(', ')}` });
  }
  if (!Array.isArray(allergens) || allergens.length > 20 ||
      !allergens.every((a) => typeof a === 'string' && ALLERGEN_RE.test(a))) {
    return res.status(400).json({ error: 'allergens must be a list like ["en:milk"] (max 20).' });
  }
  if (typeof vegetarian !== 'boolean') {
    return res.status(400).json({ error: 'vegetarian must be true or false.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { healthProfile: {
        conditions: [...new Set(conditions)],     // Set removes duplicates
        allergens: [...new Set(allergens)],
        vegetarian,
      } } },
      { new: true }                               // return the updated document
    );
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    res.json({ healthProfile: user.toObject().healthProfile });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ error: 'Could not save the profile.' });
  }
});

module.exports = router;