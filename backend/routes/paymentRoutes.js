const express = require('express');
const { initializeCheckoutForm, paymentCallback } = require('../controllers/paymentController'); // Ödeme fonksiyonu
const router = express.Router();

// Ödeme oluşturma rotası
router.post('/initialize-checkout', initializeCheckoutForm);
router.post('/callback', paymentCallback);
// router.get('/callback', paymentCallback); // ✅ GET istekleri de karşılanacak

module.exports = router;
