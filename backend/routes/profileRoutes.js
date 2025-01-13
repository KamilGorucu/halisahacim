const express = require('express');
const {
  getUserProfile,
  getBusinessProfile,
  updateBusinessProfile,
  updateUserProfile,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Kullanıcı Profili Getir
router.get('/user', protect, getUserProfile);

// İşletme Profili Getir
router.get('/business', protect, getBusinessProfile);

// İşletme Profil Güncelle
router.put('/business/update', protect, updateBusinessProfile);

// Kullanıcı Profilini Güncelle
router.put('/user/update', protect, updateUserProfile);

module.exports = router;
