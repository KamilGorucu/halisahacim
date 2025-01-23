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
    console.error('Token bulunamadı.');
    return res.status(401).json({ message: 'Yetkilendirme reddedildi. Token gerekli.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Log ekleyin.
    if (decoded.role !== 'business') {
      console.error('Yetkisiz erişim: Sadece işletmeler giriş yapabilir.');
      return res.status(403).json({ message: 'Erişim yetkisi yok! Sadece işletmeler giriş yapabilir.' });
    }

    // İşletmeyi veritabanından kontrol et
    const business = await Business.findById(decoded.id);
    console.log('Fetched Business:', business); // İşletme bilgisi kontrol ediliyor.
    if (!business) {
      console.error(`İşletme bulunamadı: ${decoded.id}`);
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    // İşletme aktif değilse yönlendirme yapılır
    if (!business.isActive) {
      console.warn('İşletme aktif değil:', business.isActive);
      return res.status(403).json({
        redirect: '/payment',
        message: 'Ödeme yapılmadan işletme aktif edilemez. Lütfen ödeme yapın.',
      });
    }

    req.businessId = decoded.id; // Token içindeki işletme kimliğini req'e ekleyin
    console.log('Middleware Business ID:', req.businessId);
    next();
  } catch (error) {
    console.error('Yetkilendirme hatası:', error.message);
    res.status(401).json({ message: 'Yetkilendirme hatası. Geçersiz veya süresi dolmuş token.' });
  }
};


module.exports = { protect, protectBusiness };
