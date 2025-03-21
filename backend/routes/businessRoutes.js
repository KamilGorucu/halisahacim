// Backend - routes/businessRoutes.js
const express = require('express');
const {
  registerBusiness,
  loginBusiness,
  listBusinesses,
  getBusinessById,
  searchBusinesses,
  updateBusinessDetails,
  addRating, // Yeni eklenen rota fonksiyonu
  approveBusiness, // Yeni eklenen fonksiyon
} = require('../controllers/businessController');
const upload = require('../middleware/uploadMiddleware');
const { protect, protectBusiness, protectAdmin } = require('../middleware/authMiddleware');
const { businessLimiter } = require('../middleware/rateLimitMiddleware'); // Rate limiter middleware
const { bruteForceProtector } = require('../middleware/bruteForceMiddleware');
const router = express.Router();

router.post('/register', businessLimiter, upload.array('photos', 5), registerBusiness);
router.post('/login', bruteForceProtector.prevent, businessLimiter, loginBusiness);

// İşletme arama ve listeleme rotaları
// Sadece onaylanmış işletmeleri listele
router.get('/list', listBusinesses);
router.get('/search', searchBusinesses); // Şehir bazlı arama
router.get('/:id', getBusinessById); // İşletme detayı

// Yeni rota: İşletmelere puan ve yorum ekleme
router.post('/:id/ratings', protect, addRating);

// İşletme detaylarını güncelleme
router.put('/update', protectBusiness, updateBusinessDetails);

// Admin onay rotası
router.put('/approve/:id', protectAdmin, approveBusiness);

module.exports = router;