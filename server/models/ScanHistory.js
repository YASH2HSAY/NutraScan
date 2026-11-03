const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  barcode: { type: String, required: true },
  name:    String,
  brand:   String,
  imageUrl: String,
  score:   { type: Number, default: null },     // the final score shown to this user
  band:    String,                              // Excellent ... Bad, or Avoid
  safetyLevel: String,                          // ok, warning or avoid
}, { timestamps: true });

// Fast "latest scans for this user"
scanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ScanHistory', scanSchema);