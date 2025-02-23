const blacklistedIPs = new Set(); // Kara listeye alınan IP'ler burada tutulur

exports.ipBlacklist = (req, res, next) => {
  const clientIP = req.ip;
  if (blacklistedIPs.has(clientIP)) {
    return res.status(403).json({ message: "Bu IP adresi kara listeye alındı!" });
  }
  next();
};

// Kara listeye IP eklemek için fonksiyon
exports.banIP = (ip) => {
  blacklistedIPs.add(ip);
  console.log(`IP yasaklandı: ${ip}`);
};
