const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: { type: [Number], required: true },
    city: { type: String, required: true },
  },
  workingHours: [
    {
      date: { type: Date, required: true }, // Tarih
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  equipment: { type: String },
  freeTrialStart: { type: Date, default: Date.now },
  photos: [{ type: String }],
  isActive: { type: Boolean, default: false },
});

BusinessSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Business', BusinessSchema);
