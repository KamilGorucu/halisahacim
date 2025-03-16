const express = require('express');
const router = express.Router();
const { rateUser } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/rate', protect, rateUser);

module.exports = router;
