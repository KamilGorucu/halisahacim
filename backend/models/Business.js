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

// Şifreyi kaydetmeden önce hashle
// Şifreyi kaydetmeden önce hashle
BusinessSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Şifreyi doğrulama metodu
BusinessSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

BusinessSchema.index({ location: '2dsphere' }); // 2D Sphere indeks
module.exports = mongoose.model('Business', BusinessSchema);
