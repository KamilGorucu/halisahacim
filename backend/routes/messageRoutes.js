const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getMessagesForBusiness,
  getChatList,
  getChatListForBusiness,
  getUnreadMessages,
  markMessagesAsRead,
} = require('../controllers/messageController');
const { protect, protectBusiness } = require('../middleware/authMiddleware');

// Kullanıcılar ve işletmeler için mesaj gönderme
router.post('/send', protect, sendMessage); 
router.post('/send-business', protectBusiness, sendMessage);

// Mesaj geçmişi
router.get('/history/:chatUserId', protect, getMessages);
router.get('/history-business/:chatUserId', protectBusiness, getMessagesForBusiness);

// Kullanıcılar için sohbet geçmişi
router.get('/chat-list', protect, getChatList);

// **İşletmeler için sohbet geçmişi**
router.get('/chat-list-business', protectBusiness, getChatListForBusiness);

// Yeni mesaj bildirimlerini getir
router.get('/unread', protect, getUnreadMessages);
router.get('/unread-business', protectBusiness, getUnreadMessages);

// Mesajları okundu olarak işaretle
router.post('/mark-read', protect, markMessagesAsRead);
router.post('/mark-read-business', protectBusiness, markMessagesAsRead);

module.exports = router;
