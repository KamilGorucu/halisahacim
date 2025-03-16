const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Kullanıcının tam adı
  email: { type: String, required: true, unique: true }, // Kullanıcının e-posta adresi
  password: { type: String, required: true }, // Kullanıcının şifresi (hashed)
  phone: {type: String, required: true},
  teams: { type: [String] }, // Kullanıcının oynadığı takımlar
  position: { type: String }, // Kullanıcının oynadığı mevki
  failedLoginAttempts: { type: Number, default: 0 }, 
  isLocked: { type: Boolean, default: false }, // Hesap kilitli mi?
  lockUntil: { type: Date }, // Hesap kilitliyse ne zamana kadar kilitli kalacağı
  rating: {
    totalScore: { type: Number, default: 0 }, // Toplam puan
    ratingCount: { type: Number, default: 0 }, // Puan veren kişi sayısı
  },
});

UserSchema.methods.getAverageRating = function () {
  return this.rating.ratingCount > 0
    ? (this.rating.totalScore / this.rating.ratingCount).toFixed(1) // Ortalama puanı hesapla
    : 'Henüz Puanlanmadı';
};

module.exports = mongoose.model('User', UserSchema);
