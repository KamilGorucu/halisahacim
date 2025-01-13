const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Kullanıcı e-posta adresi
  fullName: { type: String, required: true }, // Kart sahibinin adı
  amount: { type: Number, required: true }, // Ödeme tutarı
  status: { type: String, required: true, default: 'pending' }, // Ödeme durumu (pending, success, fail)
  paymentId: { type: String }, // İyzico ödeme ID'si
  conversationId: { type: String }, // İyzico konuşma ID'si
  createdAt: { type: Date, default: Date.now }, // Ödeme oluşturulma tarihi
});

module.exports = mongoose.model('Payment', PaymentSchema);
