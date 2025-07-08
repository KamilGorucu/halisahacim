const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Kullanıcının tam adı
  email: { type: String, required: true, unique: true }, // Kullanıcının e-posta adresi
  password: { type: String, required: true }, // Kullanıcının şifresi (hashed)
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: {type: String, required: true},
  city: { type: String, required: true }, // ➔ YENİ: Kayıt sırasında seçilecek
  teams: { type: [String] }, // Kullanıcının oynadığı takımlar
  photo: { type: String, default: '' }, // Profil fotoğrafı dosya yolu
  position: {
    type: String,
    enum: [
      'Kaleci',
      'Stoper',
      'Bek',
      'Orta Saha',
      'Ofansif Orta Saha',
      'Kanat',
      'Forvet',
    ],
    required: true,
  },
  foot: { type: String, enum: ['Sağ', 'Sol', 'Çift'], default: 'Sağ' },
  fifaStats: {
    speed: { type: Number, default: 50 },
    shooting: { type: Number, default: 50 },
    passing: { type: Number, default: 50 },
    dribbling: { type: Number, default: 50 },
    defense: { type: Number, default: 50 },
    physical: { type: Number, default: 50 },
  },
  failedLoginAttempts: { type: Number, default: 0 }, 
  isLocked: { type: Boolean, default: false }, // Hesap kilitli mi?
  lockUntil: { type: Date }, // Hesap kilitliyse ne zamana kadar kilitli kalacağı
  rating: {
    totalScore: { type: Number, default: 0 }, // Toplam puan
    ratingCount: { type: Number, default: 0 }, // Puan veren kişi sayısı
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ➔ YENİ
  pendingFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ➔ YENİ
});

UserSchema.methods.getAverageRating = function () {
  return this.rating.ratingCount > 0
    ? (this.rating.totalScore / this.rating.ratingCount).toFixed(1) // Ortalama puanı hesapla
    : 'Henüz Puanlanmadı';
};

module.exports = mongoose.model('User', UserSchema);
