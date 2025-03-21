const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

// Genel Doğrulama Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }

      // Kullanıcının hesabı kilitliyse erişimi engelle
      if (user.isLocked) {
        return res.status(403).json({ message: 'Hesabınız geçici olarak kilitlenmiştir. Lütfen daha sonra tekrar deneyin!' });
      }

      req.user = user;
      next();
    } catch (error) {
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
    console.error('Token bulunamadı.');
    return res.status(401).json({ message: 'Yetkilendirme reddedildi. Token gerekli.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'business') {
      console.error('Yetkisiz erişim: Sadece işletmeler giriş yapabilir.');
      return res.status(403).json({ message: 'Erişim yetkisi yok! Sadece işletmeler giriş yapabilir.' });
    }

    const business = await Business.findById(decoded.id);
    if (!business) {
      console.error(`İşletme bulunamadı: ${decoded.id}`);
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }
    // Ödeme tarihi kontrolü
    const today = new Date();
    if (business.nextPaymentDate && business.nextPaymentDate < today) {
      business.isActive = false;
      await business.save();
    }
    if (business.nextPaymentDate < today) {
      business.isActive = false;
      await business.save();
    }

    if (!business.isActive) {
      return res.status(403).json({
        redirect: '/payment',
        message: 'Ödeme yapılmadan işletme aktif edilemez. Lütfen ödeme yapın.',
      });
    }

    req.businessId = business._id.toString();
    req.business = business;
    next();
  } catch (error) {
    console.error('Yetkilendirme hatası:', error.message);
    res.status(401).json({ message: 'Yetkilendirme hatası. Geçersiz veya süresi dolmuş token.' });
  }
};

const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Yetkisiz erişim!" });
      }

      req.admin = { role: "admin" };
      next();
    } catch (error) {
      res.status(401).json({ message: "Yetkisiz giriş, token doğrulanamadı." });
    }
  } else {
    res.status(401).json({ message: "Token bulunamadı." });
  }
};

module.exports = { protect, protectBusiness, protectAdmin };
