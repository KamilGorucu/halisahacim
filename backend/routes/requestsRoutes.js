// routes/requestsRoutes.js
const express = require('express');
const router = express.Router();
const { createRequest, getRequests, deleteOldRequests } = require('../controllers/requestsController');
const { protect } = require('../middleware/authMiddleware');

// Talep oluştur
router.post('/', protect, createRequest);

// Talepleri listele
router.get('/', protect, getRequests);

// Talep sil
router.delete('/:requestId', deleteOldRequests);

module.exports = router;
