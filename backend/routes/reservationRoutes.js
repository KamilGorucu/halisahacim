const express = require('express');
const router = express.Router();
const { getAvailableSlots,
        createReservation,
        getBusinessReservations, 
        approveReservation, 
        rejectReservation ,
        getWeeklyReservations
    } = require('../controllers/reservationController');
const { protect, protectBusiness } = require('../middleware/authMiddleware');

// Kullanıcı için uygun saatleri getirme
router.get('/available-slots', protect, getAvailableSlots);

// Rezervasyon oluşturma rotası
router.post('/create', protect, createReservation);

// İşletme rezervasyonlarını listeleme (Sadece işletmeler için erişim)
router.get('/business-reservations', protectBusiness, getBusinessReservations);

// Rezervasyon onaylama
router.post('/approve', protectBusiness, approveReservation);

// Rezervasyon reddetme
router.post('/reject', protectBusiness, rejectReservation);

router.get('/weekly', protectBusiness, getWeeklyReservations);

module.exports = router;
