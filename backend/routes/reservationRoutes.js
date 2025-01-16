const express = require('express');
const router = express.Router();
const { getAvailableSlots } = require('../controllers/reservationController');

// Kullanıcı için uygun saatleri getirme
router.get('/available-slots', getAvailableSlots);

module.exports = router;
