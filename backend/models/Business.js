const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: String, required: true },
  price: { type: Number, required: true }, // Fiyat alanı eklendi
  workingHours: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
});

const RatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

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
  fields: [FieldSchema],
  equipment: { type: String },
  photos: [{ type: String }],
  isActive: { type: Boolean, default: false }, // Varsayılan olarak true
  isApproved: { type: Boolean, default: false }, // Admin onayı olmadan yayına çıkmasın
  nextPaymentDate: { type: Date }, // Bir sonraki ödeme tarihi
  ratings: [RatingSchema],
  averageRating: { type: Number, default: 0 },
});

BusinessSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Business', BusinessSchema);
