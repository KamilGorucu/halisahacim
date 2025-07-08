const mongoose = require('mongoose');

const subscriptionRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  fieldName: { type: String, required: true },
  dayOfWeek: { type: String, required: true }, // 'Tuesday'
  timeSlot: { type: String, required: true },  // '22:00-23:00'
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

subscriptionRequestSchema.index({ user: 1, business: 1 }, { unique: true });

module.exports = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);