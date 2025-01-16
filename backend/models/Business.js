const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  ownerName: { type: String, required: true }, // İşletme sahibinin adı
  businessName: { type: String, required: true }, // İşletme adı
  email: { type: String, required: true, unique: true }, // İşletme e-posta adresi
  password: { type: String, required: true }, // Şifre (hashed)
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'], // GeoJSON formatında konum
    },
    coordinates: { type: [Number], required: true }, // Enlem ve boylam
    city: { type: String, required: true }, // Şehir
  },
  workingHours: [
    {
      start: { type: String, required: true }, // Başlangıç saati
      end: { type: String, required: true },   // Bitiş saati
    },
  ],
  equipment: { type: String }, // Ekipman bilgileri
  freeTrialStart: { type: Date, default: Date.now }, // Ücretsiz deneme başlangıcı
  photos: [{ type: String }], // Fotoğraf yolları
  isActive: { type: Boolean, default: false }, // Ödeme sonrası aktiflik
});

BusinessSchema.index({ location: '2dsphere' }); // 2D Sphere indeks
module.exports = mongoose.model('Business', BusinessSchema);
