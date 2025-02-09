const Message = require('../models/Message');
const User = require('../models/User');
const Business = require('../models/Business');

// Mesaj gönder
const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverModel, content } = req.body;

    const newMessage = new Message({
      sender: req.businessId || req.user._id,
      senderModel: req.businessId ? 'Business' : 'User',
      receiver: receiverId,
      receiverModel,
      content,
    });

    await newMessage.save();
    res.status(201).json({ message: 'Mesaj başarıyla gönderildi.', newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Mesaj gönderilemedi.', error });
  }
};

// Kullanıcı ile mesaj geçmişini getir
const getMessages = async (req, res) => {
  try {
    const { chatUserId } = req.params;
    const userId = req.user?._id || req.businessId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatUserId },
        { sender: chatUserId, receiver: userId },
      ],
    })
      .populate('sender', 'fullName businessName role')
      .populate('receiver', 'fullName businessName role')
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Mesaj geçmişi alınırken hata:', error);
    res.status(500).json({ message: 'Mesajlar alınamadı.', error });
  }
};

// Sohbet için kullanıcı listesini getir
const getUsersForChat = async (req, res) => {
  try {
    let users = await User.find({}, 'fullName role');
    const businesses = await Business.find({}, 'businessName ownerName');
    users = users.concat(
      businesses.map((b) => ({
        _id: b._id,
        fullName: b.ownerName,
        role: 'business',
        businessName: b.businessName,
      }))
    );

    res.status(200).json(users);
  } catch (error) {
    console.error('Kullanıcılar alınamadı:', error);
    res.status(500).json({ message: 'Kullanıcılar alınamadı.', error });
  }
};

// Yeni mesaj bildirimlerini getir
const getUnreadMessages = async (req, res) => {
  try {
      const userId = req.user?._id || req.businessId;
      const userModel = req.user ? 'User' : 'Business';

      const messages = await Message.find({
          receiver: userId,
          receiverModel: userModel,
          isRead: false,
      }).populate('sender', 'fullName businessName');

      res.status(200).json(messages);
  } catch (error) {
      res.status(500).json({ message: 'Bildirimler alınamadı.', error });
  }
};

// Mesajları okundu olarak işaretle
const markMessagesAsRead = async (req, res) => {
  try {
      const { chatUserId } = req.body;
      const userId = req.user?._id || req.businessId;

      await Message.updateMany(
          {
              sender: chatUserId,
              receiver: userId,
              isRead: false,
          },
          { $set: { isRead: true } }
      );

      res.status(200).json({ message: 'Mesajlar okundu olarak işaretlendi.' });
  } catch (error) {
      res.status(500).json({ message: 'Mesajlar işaretlenirken bir hata oluştu.', error });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUsersForChat,
  getUnreadMessages,
  markMessagesAsRead,
};
