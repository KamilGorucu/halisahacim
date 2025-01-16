const express = require('express');
const {
  registerBusiness,
  loginBusiness,
  listBusinesses,
  getBusinessById,
  uploadPhoto,
  searchBusinesses,
} = require('../controllers/businessController');
const upload = require('../middleware/uploadMiddleware'); // Upload Middleware'ini dahil et
const router = express.Router();

// İşletme kayıt rotaları
router.post('/register', upload.array('photos', 5), registerBusiness); // Max 5 fotoğraf yüklenebilir
router.post('/login', loginBusiness); // İşletme girişi
// router.post('/upload', upload.single('photo'), uploadPhoto); // Fotoğraf yükleme

// İşletme arama ve listeleme rotaları
router.get('/list', listBusinesses); // Tüm işletmelerin listesi
router.get('/search', searchBusinesses); // Şehir bazlı arama
router.get('/:id', getBusinessById); // İşletme detayı

module.exports = router;
