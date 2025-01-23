const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Saha adı
  capacity: { type: String, required: true }, // Kaça kaç oynanacağı
  workingHours: [
    {
      start: { type: String, required: true }, // Başlangıç saati
      end: { type: String, required: true }, // Bitiş saati
    },
  ],
});

const BusinessSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  price: { type: Number, required: true }, // Saatlik ücret
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: { type: [Number], required: true },
    city: { type: String, required: true },
  },
  fields: [FieldSchema], // Sahalar ve saat aralıkları
  equipment: { type: String },
  photos: [{ type: String }],
  isActive: { type: Boolean, default: false },
});

BusinessSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Business', BusinessSchema);
