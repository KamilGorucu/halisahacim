const Message = require('../models/Message');
const User = require('../models/User');
const Business = require('../models/Business');

// Mesaj gönder
const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverModel, content } = req.body;

    const newMessage = new Message({
      sender: req.user ? req.user._id : req.businessId, // Kullanıcı mı işletme mi?
      senderModel: req.user ? 'User' : 'Business',
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

// Mesaj geçmişini getir
const getMessages = async (req, res) => {
  try {
    const { chatUserId } = req.params;
    const userId = req.user?._id || req.businessId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatUserId },
        { sender: chatUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Mesajlar alınamadı.', error });
  }
};

const getMessagesForBusiness = async (req, res) => {
  try {
    const { chatUserId } = req.params;
    const businessId = req.businessId; // İşletme ID'yi çek

    if (!businessId) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const messages = await Message.find({
      $or: [
        { sender: businessId, receiver: chatUserId },
        { sender: chatUserId, receiver: businessId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('İşletme mesaj geçmişi alınırken hata:', error);
    res.status(500).json({ message: 'Mesajlar alınamadı.', error });
  }
};

// **Kullanıcılar için sohbet geçmişi olanları getir**
const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    const chatIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== userId.toString()) {
        chatIds.add(JSON.stringify({ id: msg.sender.toString(), model: msg.senderModel }));
      }
      if (msg.receiver.toString() !== userId.toString()) {
        chatIds.add(JSON.stringify({ id: msg.receiver.toString(), model: msg.receiverModel }));
      }
    });

    const chatList = [];
    for (let chat of chatIds) {
      const parsedChat = JSON.parse(chat);
      if (parsedChat.model === 'User') {
        const user = await User.findById(parsedChat.id).select('_id fullName');
        if (user) chatList.push({ id: user._id, name: user.fullName, type: 'User' });
      } else {
        const business = await Business.findById(parsedChat.id).select('_id businessName');
        if (business) chatList.push({ id: business._id, name: business.businessName, type: 'Business' });
      }
    }

    res.status(200).json(chatList);
  } catch (error) {
    console.error('Sohbet listesi alınırken hata:', error);
    res.status(500).json({ message: 'Sohbet listesi alınamadı.', error });
  }
};

// **İşletmeler için sohbet geçmişi olan kullanıcıları getir**
const getChatListForBusiness = async (req, res) => {
  try {
    const businessId = req.businessId; // Sadece işletmeler için çalışıyor

    const messages = await Message.find({
      $or: [{ sender: businessId }, { receiver: businessId }],
    });

    const chatIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== businessId.toString()) {
        chatIds.add(JSON.stringify({ id: msg.sender.toString(), model: msg.senderModel }));
      }
      if (msg.receiver.toString() !== businessId.toString()) {
        chatIds.add(JSON.stringify({ id: msg.receiver.toString(), model: msg.receiverModel }));
      }
    });

    const chatList = [];
    for (let chat of chatIds) {
      const parsedChat = JSON.parse(chat);
      if (parsedChat.model === 'User') {
        const user = await User.findById(parsedChat.id).select('_id fullName');
        if (user) chatList.push({ id: user._id, name: user.fullName, type: 'User' });
      } else {
        const business = await Business.findById(parsedChat.id).select('_id businessName');
        if (business) chatList.push({ id: business._id, name: business.businessName, type: 'Business' });
      }
    }

    res.status(200).json(chatList);
  } catch (error) {
    console.error('İşletme sohbet listesi alınırken hata:', error);
    res.status(500).json({ message: 'İşletme sohbet listesi alınamadı.', error });
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
  getMessagesForBusiness,
  getChatList,
  getChatListForBusiness,
  getUnreadMessages,
  markMessagesAsRead,
};
