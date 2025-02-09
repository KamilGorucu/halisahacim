const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyRecaptcha = require('../middleware/recaptchaMiddleware');

exports.registerUser = async (req, res) => {
  const { fullName, email, password, phone, teams, position } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      fullName, 
      email, 
      password: hashedPassword, 
      phone, // Telefon numarasını kaydet
      teams, // Oynadığı takımları kaydet
      position,
    });

    await newUser.save();
    res.status(201).json({ message: 'Kayıt başarılı!' });
  } catch (error) {
    res.status(500).json({ message: 'Kayıt başarısız!', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz şifre!' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Giriş başarılı!', token, role: 'user' });
  } catch (error) {
    res.status(500).json({ message: 'Giriş başarısız!', error: error.message });
  }
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
