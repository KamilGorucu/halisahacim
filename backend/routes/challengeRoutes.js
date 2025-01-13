const express = require('express');
const { createChallenge, getChallenges } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// İlan oluştur
router.post('/create', protect, createChallenge);

// İlanları listele
router.get('/', getChallenges);

module.exports = router;
