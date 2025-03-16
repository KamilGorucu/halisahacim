const mongoose = require("mongoose");

const rateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // ⏳ 5 dakika sonra otomatik silinir
});

const RateLimit = mongoose.model("RateLimit", rateLimitSchema);
module.exports = RateLimit;
