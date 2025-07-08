const mongoose = require('mongoose');

const LineupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [
    {
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      position: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Lineup', LineupSchema);