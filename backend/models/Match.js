const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  playersA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  playersB: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lineupA: { type: mongoose.Schema.Types.ObjectId, ref: 'Lineup' },
  lineupB: { type: mongoose.Schema.Types.ObjectId, ref: 'Lineup' },
  matchDate: { type: Date, required: true },
  matchLocation: { type: String },
  hour: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['upcoming', 'completed', 'matched'], default: 'upcoming' },
  ratingGiven: [{
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
