const express = require('express');
const {
  createTournament,
  getTournaments,
  registerForTournament,
} = require('../controllers/tournamentController');
const { protect, protectBusiness } = require('../middleware/authMiddleware');

const router = express.Router();

// Turnuva oluştur (sadece işletme sahipleri)
router.post('/create', protect, protectBusiness, createTournament);

// Turnuvaları listele
router.get('/', getTournaments);

// Turnuvaya kayıt
router.post('/register', protect, registerForTournament);

module.exports = router;
