const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMatch,
  getUserMatches,
  rateMatchStats,
  canUserRate,
} = require('../controllers/matchController');

router.post('/', protect, createMatch);
router.get('/:userId', protect, getUserMatches);
router.patch('/:id/rate', protect, rateMatchStats);
router.get('/:id/can-rate/:userId', protect, canUserRate);

module.exports = router;
