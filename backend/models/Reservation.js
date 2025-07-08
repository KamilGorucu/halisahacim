const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    fieldName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isRecurring: { type: Boolean, default: false },
    fromSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionRequest' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
