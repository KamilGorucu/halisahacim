const rateLimit = require('express-rate-limit');

// Kullanıcı kayıt/giriş işlemleri için hız sınırlaması (5 dakika içinde max 5 deneme)
exports.userLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 5, // Maksimum 5 istek
  message: { message: "Çok fazla istek attınız. Lütfen 5 dakika sonra tekrar deneyin!" },
  headers: true,
});

// İşletme kayıt/giriş işlemleri için hız sınırlaması (10 dakika içinde max 3 deneme)
exports.businessLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika
  max: 3, // Maksimum 3 istek
  message: { message: "Çok fazla istek attınız. Lütfen 10 dakika sonra tekrar deneyin!" },
  headers: true,
});
