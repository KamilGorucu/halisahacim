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
} = require('../controllers/businessController');
const upload = require('../middleware/uploadMiddleware');
const { protect, protectBusiness } = require('../middleware/authMiddleware');
const { businessLimiter } = require('../middleware/rateLimitMiddleware'); // Rate limiter middleware
const { bruteForceProtector } = require('../middleware/bruteForceMiddleware');
const router = express.Router();

router.post('/register', businessLimiter, upload.array('photos', 5), registerBusiness);
router.post('/login', bruteForceProtector.prevent, businessLimiter, loginBusiness);

// İşletme arama ve listeleme rotaları
router.get('/list', listBusinesses); // Tüm işletmelerin listesi
router.get('/search', searchBusinesses); // Şehir bazlı arama
router.get('/:id', getBusinessById); // İşletme detayı

// Yeni rota: İşletmelere puan ve yorum ekleme
router.post('/:id/ratings', protect, addRating);

// İşletme detaylarını güncelleme
router.put('/update', protectBusiness, updateBusinessDetails);

module.exports = router;