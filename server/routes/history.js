const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ScanHistory = require('../models/ScanHistory');

const router = express.Router();

// GET /api/history: my last 25 scans, newest first
router.get('/', requireAuth, async (req, res) => {
  try {
    const scans = await ScanHistory.find({ userId: req.userId })   // only MY scans
      .sort({ createdAt: -1 })
      .limit(25);
    res.json({ scans });
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ error: 'Could not load history.' });
  }
});

module.exports = router;