const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, required: true }, // Gönderen ID
  senderModel: { type: String, enum: ['User', 'Business'], required: true }, // Gönderen Model
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true }, // Alıcı ID
  receiverModel: { type: String, enum: ['User', 'Business'], required: true }, // Alıcı Model
  content: { type: String, required: true }, // Mesaj içeriği
  isRead: { type: Boolean, default: false }, // Mesaj okundu bilgisi
  timestamp: { type: Date, default: Date.now }, // Mesaj tarihi
});

module.exports = mongoose.model('Message', messageSchema);
