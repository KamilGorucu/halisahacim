const RateLimit = require("../models/rateLimit");

// Kullanıcı giriş işlemleri için hız sınırlaması (10 dakika içinde max 10 deneme)
exports.userLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const userId = req.user ? req.user._id : null;
    const endpoint = req.originalUrl;

    // Son 10 dakikadaki istekleri say
    const requestCount = await RateLimit.countDocuments({
      $or: [{ ip }, { userId }],
      endpoint
    });

    if (requestCount >= 10) {
      return res.status(429).json({
        message: "Çok fazla giriş denemesi yaptınız. Lütfen 10 dakika bekleyin!"
      });
    }

    // Yeni bir giriş denemesi kaydı ekleyelim (MongoDB TTL ile otomatik silinecek)
    await RateLimit.create({ ip, userId, endpoint });

    next();
  } catch (error) {
    console.error("Rate limit hatası:", error);
    res.status(500).json({ message: "Rate limiting kontrolü sırasında hata oluştu." });
  }
};

// İşletme giriş işlemleri için hız sınırlaması (10 dakika içinde max 6 deneme)
exports.businessLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const userId = req.user ? req.user._id : null;
    const endpoint = req.originalUrl;

    // Son 10 dakikadaki istekleri say
    const requestCount = await RateLimit.countDocuments({
      $or: [{ ip }, { userId }],
      endpoint
    });

    if (requestCount >= 6) {
      return res.status(429).json({
        message: "Çok fazla giriş denemesi yaptınız. Lütfen 10 dakika bekleyin!"
      });
    }

    // Yeni bir giriş denemesi kaydı ekleyelim (MongoDB TTL ile otomatik silinecek)
    await RateLimit.create({ ip, userId, endpoint });

    next();
  } catch (error) {
    console.error("Rate limit hatası:", error);
    res.status(500).json({ message: "Rate limiting kontrolü sırasında hata oluştu." });
  }
};
