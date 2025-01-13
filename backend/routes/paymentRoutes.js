const express = require('express');
const { createPayment } = require('../controllers/paymentController'); // Ödeme fonksiyonu
const router = express.Router();

// Ödeme oluşturma rotası
router.post('/create-payment', createPayment);

module.exports = router;
