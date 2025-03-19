const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { userLimiter } = require('../middleware/rateLimitMiddleware'); // Rate limiter middleware
const { bruteForceProtector } = require('../middleware/bruteForceMiddleware');
const { getUserProfile, updateUserProfile, getPublicUserProfile } = require('../controllers/userController');

// Kullanıcı Kayıt Rotası
router.post('/register', userLimiter, registerUser);

// Kullanıcı Giriş Rotası
router.post('/login', bruteForceProtector.prevent, userLimiter, loginUser);

// Kullanıcı profil bilgileri
router.get('/profile', protect, getUserProfile);

router.get('/:userId', protect, getPublicUserProfile);

// Kullanıcı profil güncelleme
router.put('/profile/update', protect, updateUserProfile);

module.exports = router;
