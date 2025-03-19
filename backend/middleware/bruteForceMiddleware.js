const ExpressBrute = require('express-brute');

// Brute force saldırıları için geçici bellek kullanarak limit koyma
const bruteStore = new ExpressBrute.MemoryStore();

exports.bruteForceProtector = new ExpressBrute(bruteStore, {
  freeRetries: 10, // 10 yanlış giriş hakkı
  minWait: 5 * 60 * 1000, // 5 dakika kilitleme
  maxWait: 60 * 60 * 1000, // Maksimum 1 saat kilitleme
  failCallback: (req, res) => {
    res.status(429).json({ message: "Çok fazla başarısız giriş denemesi. Lütfen 5 dakika sonra tekrar deneyin." });
  },
});
