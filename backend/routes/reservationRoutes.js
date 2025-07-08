const express = require('express');
const router = express.Router();
const { getAvailableSlots,
        getWeeklyAvailableSlots,
        createReservation,
        getBusinessReservations, 
        approveReservation, 
        rejectReservation ,
        getWeeklyReservations,
        getDailyReservations,
        deleteReservation
    } = require('../controllers/reservationController');
const { protect, protectBusiness } = require('../middleware/authMiddleware');

// Kullanıcı için uygun saatleri getirme
router.get('/available-slots', protect, getAvailableSlots);
router.get('/weekly-user', getWeeklyAvailableSlots);

// Rezervasyon oluşturma rotası
router.post('/create', protect, createReservation);

// İşletme rezervasyonlarını listeleme (Sadece işletmeler için erişim)
router.get('/business-reservations', protectBusiness, getBusinessReservations);

// Rezervasyon onaylama
router.post('/approve', protectBusiness, approveReservation);

// Rezervasyon reddetme
router.post('/reject', protectBusiness, rejectReservation);

// Rezervasyon Silme
router.delete('/:id', protectBusiness, deleteReservation);

router.get('/weekly', protectBusiness, getWeeklyReservations);
router.get('/daily', protectBusiness, getDailyReservations);

module.exports = router;
