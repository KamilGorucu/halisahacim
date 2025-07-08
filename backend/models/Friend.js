const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true, // İstek zamanı için createdAt, updatedAt otomatik oluşur
});

module.exports = mongoose.model('Friend', FriendSchema);