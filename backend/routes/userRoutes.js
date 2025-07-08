const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { userLimiter } = require('../middleware/rateLimitMiddleware'); // Rate limiter middleware
const { bruteForceProtector } = require('../middleware/bruteForceMiddleware');
const { registerUser, loginUser, getUserProfile, updateUserProfile, getPublicUserProfile, searchUsersByCity } = require('../controllers/userController');

// Kullanıcı Kayıt Rotası
router.post('/register', upload.single('photo'), userLimiter, registerUser);

// Kullanıcı Giriş Rotası
router.post('/login', bruteForceProtector.prevent, userLimiter, loginUser);

// 🔥 Şehre göre kullanıcı arama (Eksik olan buydu!)
router.get('/search', protect, searchUsersByCity);

// Kullanıcı profil bilgileri
router.get('/profile', protect, getUserProfile);

// Kullanıcı profil güncelleme
router.put('/profile/update', protect, updateUserProfile);

router.get('/:userId', protect, getPublicUserProfile);

module.exports = router;
