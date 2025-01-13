const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Kullanıcının tam adı
  email: { type: String, required: true, unique: true }, // Kullanıcının e-posta adresi
  password: { type: String, required: true }, // Kullanıcının şifresi (hashed)
  phone: {type: String, required: true},
  teams: { type: [String] }, // Kullanıcının oynadığı takımlar
  position: { type: String }, // Kullanıcının oynadığı mevki
});

module.exports = mongoose.model('User', UserSchema);
