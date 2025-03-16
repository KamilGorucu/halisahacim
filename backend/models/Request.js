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
    enum: ['findOpponent', 'findPlayer', 'findTeam'], // Rakip bulma veya oyuncu bulma
    required: true,
  },
  location: {
    city: { type: String, required: true }, // Şehir bilgisi
  },
  teamSize: {
    type: String, // Örneğin: 5v5, 7v7 (Sadece Rakip Bul için)
  },
  position: {
    type: String,
  },
  positionNeeded: {
    type: String, // Örneğin: Kaleci, Forvet (Sadece Oyuncu Bul için)
  },
  description: {
    type: String, // Açıklama
  },
  status: {
    type: String,
    enum: ['open', 'matched', 'completed'], // Açık, eşleşmiş, tamamlanmış
    default: 'open',
  },
  matchedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Eşleştiği kullanıcı
  },
  matchDate: {
    type: Date, // Maç tarihi
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', RequestSchema);
