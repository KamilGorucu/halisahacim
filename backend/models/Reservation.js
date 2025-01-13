const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kullanıcı
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }, // İşletme
  date: { type: Date, required: true }, // Rezervasyon tarihi
  timeSlot: { type: String, required: true }, // Saat aralığı (ör: 14:00-15:00)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Durum
});

module.exports = mongoose.model('Reservation', reservationSchema);
