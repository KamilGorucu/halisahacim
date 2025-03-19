const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const verifyRecaptcha = require('../middleware/recaptchaMiddleware');

exports.registerUser = async (req, res) => {
  const { fullName, email, password, phone, teams, position, recaptchaToken } = req.body;

  try {
    // req.body.recaptchaToken = recaptchaToken; // reCAPTCHA token’ı doğrulama için middleware'e iletiliyor
    // await verifyRecaptcha(req, res, async () => {
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
    const user = await User.findById(userId).select('fullName teams position');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı bilgileri alınamadı.', error: error.message });
  }
};