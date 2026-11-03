const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();                       // a mini-app for auth routes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;         // something@something.something

// Create a token that says "this is user X" and expires in 7 days
function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body || {};          // "|| {}" avoids a crash if no body

  // Validate input before touching the database
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 8 to 72 characters.' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: cleanEmail })) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);   // 10 = cost factor
    const user = await User.create({ email: cleanEmail, passwordHash });

    res.status(201).json({
      token: makeToken(String(user._id)),
      user: { id: user._id, email: user.email },            // never send the hash back
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Could not create the account.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Same message whether the email or the password is wrong
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json({ token: makeToken(String(user._id)), user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Could not log in.' });
  }
});

module.exports = router;