const express = require('express');
const {
  registerBusiness,
  loginBusiness,
  listBusinesses,
  getBusinessById,
  searchBusinesses,
} = require('../controllers/businessController');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/register', upload.array('photos', 5), registerBusiness);
router.post('/login', loginBusiness);

// İşletme arama ve listeleme rotaları
router.get('/list', listBusinesses); // Tüm işletmelerin listesi
router.get('/search', searchBusinesses); // Şehir bazlı arama
router.get('/:id', getBusinessById); // İşletme detayı

module.exports = router;
