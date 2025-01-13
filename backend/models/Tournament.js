const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Turnuva adı
  date: { type: Date, required: true }, // Turnuva tarihi
  location: {
    city: { type: String, required: true }, // Şehir
    coordinates: { type: [Number], required: true }, // Enlem ve boylam
  },
  fee: { type: Number, required: true }, // Katılım ücreti
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Katılımcılar
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Organizatör
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tournament', tournamentSchema);
