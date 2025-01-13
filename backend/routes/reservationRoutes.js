const express = require('express');
const {
  createReservation,
  getReservationsForBusiness,
  getUserReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');
const { protect, protectBusiness } = require('../middleware/authMiddleware');
const router = express.Router();

// Rezervasyon oluştur
router.post('/create', protect, createReservation);

// İşletmeye ait rezervasyonları al
router.get('/business', protectBusiness, getReservationsForBusiness);

// Kullanıcıya ait rezervasyonları al
router.get('/user', protect, getUserReservations);

// Rezervasyon durumunu güncelle
router.put('/update-status', protectBusiness, updateReservationStatus);

module.exports = router;
