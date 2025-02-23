// routes/requestsRoutes.js
const express = require('express');
const router = express.Router();
const { createRequest, getRequests, deleteOldRequests, updateRequestStatus } = require('../controllers/requestsController');
const { protect } = require('../middleware/authMiddleware');

// Talep oluştur
router.post('/', protect, createRequest);

// Talepleri listele
router.get('/', protect, getRequests);

// Talep durumu güncelle ("Aranan Rakip/Oyuncu Bulundu" işareti için)
router.put('/:requestId/status', protect, updateRequestStatus);

// Talep sil
router.delete('/:requestId', deleteOldRequests);

module.exports = router;
