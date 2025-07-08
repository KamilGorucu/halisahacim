const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  checkFriendStatus,   // Ekliyoruz
  sendFriendRequestDirect // Ekliyoruz
} = require('../controllers/friendController');

const router = express.Router();

// 🔥 Şehre göre arkadaşlık durumunu kontrol et
router.get('/status/:userId', protect, checkFriendStatus);

// 🔥 Arkadaşlık isteği doğrudan gönder
router.post('/add', protect, sendFriendRequestDirect);

// Arkadaşlık isteği gönder
router.post('/send-request', protect, sendFriendRequest);

// Bekleyen arkadaşlık isteklerini getir
router.get('/pending', protect, getPendingRequests);

// Arkadaşlık isteğini kabul et
router.post('/accept/:id', protect, acceptFriendRequest);

// Arkadaşlık isteğini reddet
router.post('/reject/:id', protect, rejectFriendRequest);

// Arkadaş listesini getir
router.get('/list', protect, getFriends);

module.exports = router;
