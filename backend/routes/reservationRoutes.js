const express = require('express');
const router = express.Router();
const { getAvailableSlots,
        createReservation,
        getBusinessReservations, 
        approveReservation, 
        rejectReservation 
    } = require('../controllers/reservationController');
const { protectBusiness } = require('../middleware/authMiddleware');

// Kullanıcı için uygun saatleri getirme
router.get('/available-slots', getAvailableSlots);

// Rezervasyon oluşturma rotası
router.post('/create', createReservation);

// İşletme rezervasyonlarını listeleme (Sadece işletmeler için erişim)
router.get('/business-reservations', protectBusiness, getBusinessReservations);

// Rezervasyon onaylama
router.post('/approve', protectBusiness, approveReservation);

// Rezervasyon reddetme
router.post('/reject', protectBusiness, rejectReservation);

module.exports = router;
