const express = require('express');
const router = express.Router();
const {
  getUserLineups,
  createLineup,
  updateLineup,
  deleteLineup,
} = require('../controllers/lineupController');
const { protect } = require('../middleware/authMiddleware');

// Tüm kadroları getir
router.get('/:userId', protect, getUserLineups); 

// Kadro oluştur
router.post('/', protect, createLineup);

// Kadro güncelle
router.put('/:id', protect, updateLineup);

// Kadro sil
router.delete('/:id', protect, deleteLineup);

module.exports = router;
