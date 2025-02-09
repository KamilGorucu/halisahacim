// models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Kullanıcı referansı
    required: true,
  },
  type: {
    type: String,
    enum: ['findOpponent', 'findPlayer'], // Rakip bulma veya oyuncu bulma
    required: true,
  },
  location: {
    city: { type: String, required: true }, // Şehir bilgisi
  },
  teamSize: {
    type: String, // Örneğin: 5v5, 7v7 (Sadece Rakip Bul için)
  },
  positionNeeded: {
    type: String, // Örneğin: Kaleci, Forvet (Sadece Oyuncu Bul için)
  },
  description: {
    type: String, // Açıklama
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', RequestSchema);
