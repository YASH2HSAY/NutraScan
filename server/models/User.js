const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },    // the bcrypt fingerprint, never the password

  // The health profile used by our scoring functions
  healthProfile: {
    conditions: { type: [String], default: [] },     // 'diabetes', 'hypertension', ...
    allergens:  { type: [String], default: [] },     // 'en:milk', ...
    vegetarian: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);