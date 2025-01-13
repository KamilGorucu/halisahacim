const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Genel Doğrulama Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password'); // Kullanıcı bilgileri
      next();
    } catch (error) {
      console.error('Token doğrulama hatası:', error.message);
      res.status(401).json({ message: 'Yetkisiz erişim, token doğrulanamadı.' });
    }
  } else {
    res.status(401).json({ message: 'Token bulunamadı.' });
  }
};

// İşletme Sahiplerine Özel Middleware
const protectBusiness = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme reddedildi.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.business = await Business.findById(decoded.id);

    if (!req.business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    // İşletme aktif değilse ödeme sayfasına yönlendirin
    if (!req.business.isActive) {
      return res.status(403).json({ redirect: '/payment', message: 'Ödeme yapılmadan işletme aktif edilemez.' });
    }

    next();
  } catch (error) {
    console.error('Yetkilendirme hatası:', error.message);
    res.status(401).json({ message: 'Yetkilendirme hatası.' });
  }
};


module.exports = { protect, protectBusiness };
