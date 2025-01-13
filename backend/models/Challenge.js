const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['rakip-bul', 'eksik-oyuncu'], required: true },
  details: { type: String, required: true }, // İlanın açıklaması
  contactInfo: { type: String, required: true }, // İletişim bilgileri
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Challenge', challengeSchema);
