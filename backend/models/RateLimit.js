const mongoose = require("mongoose");

const rateLimitSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    endpoint: { type: String, required: true }, // Hangi API isteği olduğu
    createdAt: { type: Date, default: Date.now, expires: 300 } // 5 dakika sonra silinir
  }
);

module.exports = mongoose.model("RateLimit", rateLimitSchema);
