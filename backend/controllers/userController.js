const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const verifyRecaptcha = require('../middleware/recaptchaMiddleware');

const allowedPositions = [
  'Kaleci',
  'Stoper',
  'Bek',
  'Orta Saha',
  'Ofansif Orta Saha',
  'Kanat',
  'Forvet',
];

exports.registerUser = async (req, res) => {
  const { fullName, email, password, phone, teams, position, recaptchaToken, foot, city } = req.body;
  const photoPath = req.file ? req.file.path : '';

  try {
    // req.body.recaptchaToken = recaptchaToken; // reCAPTCHA token’ı doğrulama için middleware'e iletiliyor
    // await verifyRecaptcha(req, res, async () => {
      if (!allowedPositions.includes(position)) {
        return res.status(400).json({ message: 'Geçersiz pozisyon seçimi.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        phone,
        teams,
        position,
        foot,
        city,
        photo: photoPath,
      });

      await newUser.save();

      res.status(201).json({ message: 'Kayıt başarılı!' });
    // });
  } catch (error) {
    res.status(500).json({ message: 'Kayıt başarısız!', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password, } = req.body;
  // await verifyRecaptcha(req, res, async () => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }
    
    // Hesap kilitli mi ve kilit açılma süresi doldu mu kontrol et
    if (user.isLocked && user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ message: "Hesabınız çok fazla hatalı giriş nedeniyle kilitlendi. Lütfen daha sonra tekrar deneyin!" });
    } else if (user.isLocked && user.lockUntil <= Date.now()) {
      user.isLocked = false;
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika kilitlenir
      }
      await user.save();
      return res.status(401).json({ message: "Geçersiz şifre!" });
    }
    // ✅ Brute sayacını sıfırla
    if (req.brute) await req.brute.reset();
    
    // Başarılı giriş, hatalı giriş sayısını sıfırla
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Giriş başarılı!', token, role: 'user' });
  } catch (error) {
    res.status(500).json({ message: 'Giriş başarısız!', error: error.message });
  }
// });
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Profil bilgileri alınamadı.', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }
    res.status(200).json({ message: 'Profil başarıyla güncellendi!', user });
  } catch (error) {
    res.status(500).json({ message: 'Profil güncellenemedi.', error: error.message });
  }
};

exports.getPublicUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('fullName teams position photo fifaStats city foot');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      teams: user.teams,
      position: user.position,
      photo: user.photo,
      imageUrl: user.photo ? `${process.env.REACT_APP_API_URL}/${user.photo}` : '', // ✅ otomatik URL üret
      fifaStats: user.fifaStats,
      city: user.city,
      foot: user.foot,
    });
  } catch (error) {
    console.error('Kullanıcı arama hatası:', error);
    res.status(500).json({ message: 'Kullanıcı bilgileri alınamadı.', error: error.message });
  }
};

// Şehre göre kullanıcı ara
exports.searchUsersByCity = async (req, res) => {
  try {
    const { city, name } = req.query;
    const query = {};

    if (city) {
      query.city = city; // Şehir seçiliyse filtrele
    }

    if (name) {
      query.fullName = { $regex: name, $options: 'i' }; // İsme göre arama (case-insensitive)
    }

    const users = await User.find(query).select('fullName email _id fifaStats position photo foot');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Kullanıcı arama hatası:', error);
    res.status(500).json({ message: 'Kullanıcılar alınamadı.', error: error.message });
  }
};