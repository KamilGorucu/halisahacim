const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

// Kullanıcı Kayıt Rotası
router.post('/register', registerUser);

// Kullanıcı Giriş Rotası
router.post('/login', loginUser);

// Kullanıcı profil bilgileri
router.get('/profile', protect, getUserProfile);

// Kullanıcı profil güncelleme
router.put('/profile/update', protect, updateUserProfile);

module.exports = router;
