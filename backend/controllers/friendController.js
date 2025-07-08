const Friend = require('../models/Friend');
const User = require('../models/User');

// İstek gönder
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    const existingRequest = await Friend.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Zaten bekleyen bir istek var.' });
    }

    await Friend.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    res.status(201).json({ message: 'Arkadaşlık isteği gönderildi.' });
  } catch (error) {
    res.status(500).json({ message: 'İstek gönderilirken hata oluştu.', error: error.message });
  }
};

// İstek kabul
exports.acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await Friend.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'İstek bulunamadı.' });
    }

    request.status = 'accepted';
    await request.save();

    res.status(200).json({ message: 'İstek kabul edildi.' });
  } catch (error) {
    res.status(500).json({ message: 'İstek kabul edilirken hata oluştu.', error: error.message });
  }
};

// İstek reddet
exports.rejectFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await Friend.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'İstek bulunamadı.' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'İstek reddedildi.' });
  } catch (error) {
    res.status(500).json({ message: 'İstek reddedilirken hata oluştu.', error: error.message });
  }
};

// Arkadaşları getir
exports.getFriends = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const friends = await Friend.find({
        $or: [
          { sender: userId, status: 'accepted' },
          { receiver: userId, status: 'accepted' },
        ]
      }).populate('sender receiver', 'fullName email position foot fifaStats photo');
  
      // Giriş yapan kullanıcı dışındaki kullanıcıyı ayıklayıp frontend'e net bir şekilde göndermek için:
      const cleanFriends = friends.map((f) => {
        const otherUser = f.sender._id.toString() === userId ? f.receiver : f.sender;
        return {
          _id: f._id,
          otherUser,
        };
      });
  
      res.status(200).json(cleanFriends);
    } catch (error) {
      res.status(500).json({ message: 'Arkadaşlar alınamadı.', error: error.message });
    }
  };

// Bekleyen istekleri getir
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await Friend.find({
      receiver: userId,
      status: 'pending'
    }).populate('sender', 'fullName email position foot fifaStats photo');

    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Bekleyen istekler alınamadı.', error: error.message });
  }
};

// Kullanıcıya arkadaşlık durumu sorgula
exports.checkFriendStatus = async (req, res) => {
    try {
      const userId = req.user.id;
      const targetUserId = req.params.userId;
  
      const existingFriend = await Friend.findOne({
        $or: [
          { sender: userId, receiver: targetUserId },
          { sender: targetUserId, receiver: userId },
        ]
      });
  
      if (!existingFriend) {
        return res.status(200).json({ status: 'none' }); // Hiç ilişki yok
      }
  
      return res.status(200).json({ status: existingFriend.status });
    } catch (error) {
      res.status(500).json({ message: 'Durum alınamadı.', error: error.message });
    }
  };
  
  // Direkt arkadaşlık isteği gönder
  exports.sendFriendRequestDirect = async (req, res) => {
    try {
      const { receiverId } = req.body;
      const senderId = req.user.id;
  
      const existingFriend = await Friend.findOne({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      });
  
      if (existingFriend) {
        return res.status(400).json({ message: 'Zaten bir arkadaşlık ilişkisi var.' });
      }
  
      await Friend.create({
        sender: senderId,
        receiver: receiverId,
        status: 'pending'
      });
  
      res.status(201).json({ message: 'Arkadaşlık isteği gönderildi.' });
    } catch (error) {
      res.status(500).json({ message: 'İstek gönderilemedi.', error: error.message });
    }
  };
