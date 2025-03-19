const RateLimit = require("../models/rateLimit");

// Hız sınırlama kontrolü
const checkRateLimit = async (req, res, next, limit, timeWindow) => {
  try {
    const ip = req.ip;
    const userId = req.user ? req.user._id : null;

    // Aynı kullanıcı veya IP için son belirlenen süre içindeki istekleri say
    const requestCount = await RateLimit.countDocuments({
      $or: [{ ip }, { userId }],
      endpoint: req.originalUrl, // Farklı API isteklerini ayrı takip et
    });

    if (requestCount >= limit) {
      return res.status(429).json({
        message: `Çok fazla istek attınız. Lütfen ${timeWindow / 60} dakika sonra tekrar deneyin!`,
      });
    }

    // Yeni giriş kaydı oluştur (MongoDB TTL sayesinde otomatik silinir)
    await RateLimit.create({ ip, userId, endpoint: req.originalUrl });

    next();
  } catch (error) {
    console.error("Rate limit hatası:", error);
    res.status(500).json({ message: "Rate limiting kontrolü sırasında hata oluştu." });
  }
};

// Kullanıcı giriş denemeleri için hız sınırlaması (5 dakika içinde max 10 deneme)
exports.userLimiter = (req, res, next) => checkRateLimit(req, res, next, 10, 300);

// İşletme giriş denemeleri için hız sınırlaması (10 dakika içinde max 6 deneme)
exports.businessLimiter = (req, res, next) => checkRateLimit(req, res, next, 6, 600);
