const RateLimit = require("../models/RateLimit");

// Kullanıcı giriş işlemleri için hız sınırlaması
exports.userLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const userId = req.user ? req.user._id : null; // Kullanıcı giriş yapmışsa ID kullan

    // Son 5 dakikadaki istekleri say
    const requestCount = await RateLimit.countDocuments({
      $or: [{ ip }, { userId }],
    });

    if (requestCount >= 10) {
      return res.status(429).json({
        message: "Çok fazla giriş denemesi yaptınız. Lütfen 5 dakika bekleyin!",
      });
    }

    // Yeni bir giriş denemesi kaydı ekleyelim (MongoDB TTL ile otomatik silinecek)
    await RateLimit.create({ ip, userId });

    next();
  } catch (error) {
    console.error("Rate limit hatası:", error);
    res.status(500).json({ message: "Rate limiting kontrolü sırasında hata oluştu." });
  }
};

exports.businessLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const userId = req.user ? req.user._id : null;

    // Son 10 dakikadaki istekleri say
    const requestCount = await RateLimit.countDocuments({
      $or: [{ ip }, { userId }],
    });

    if (requestCount >= 6) {
      return res.status(429).json({
        message: "Çok fazla giriş denemesi yaptınız. Lütfen 10 dakika bekleyin!",
      });
    }

    // Yeni bir giriş denemesi kaydı ekleyelim (MongoDB TTL ile otomatik silinecek)
    await RateLimit.create({ ip, userId });

    next();
  } catch (error) {
    console.error("Rate limit hatası:", error);
    res.status(500).json({ message: "Rate limiting kontrolü sırasında hata oluştu." });
  }
};
