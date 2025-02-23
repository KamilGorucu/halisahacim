// controllers/requestsController.js
const Request = require('../models/Request');
const User = require('../models/User');

// Yeni talep oluştur
const createRequest = async (req, res) => {
  try {
    const { type, teamSize, positionNeeded, description, location } = req.body;

    if (!location || !location.city) {
      return res.status(400).json({ message: 'Şehir bilgisi gereklidir.' });
    }

    const newRequest = new Request({
      user: req.user.id,
      type,
      location, // Şehir bilgisi frontend'den alınır
      teamSize: type === 'findOpponent' ? teamSize : undefined,
      positionNeeded: type === 'findPlayer' ? positionNeeded : undefined,
      description,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Talep başarıyla oluşturuldu!', request: newRequest });
  } catch (error) {
    console.error('Talep oluşturma hatası:', error);
    res.status(500).json({ message: 'Talep oluşturulurken bir hata oluştu.', error });
  }
};

// Talepleri listele
const getRequests = async (req, res) => {
  try {
    const { type, city } = req.query; // Şehir ve talep türü bilgisi alınıyor

    if (!type || !city) {
      return res.status(400).json({ message: 'Tür ve şehir bilgisi gereklidir.' });
    }

    const requests = await Request.find({
      type,
      'location.city': city,
    })
      .populate('user', 'fullName position')
      .sort({ createdAt: -1 }); // Tarihe göre sıralama (en yeni)

    res.status(200).json(requests);
  } catch (error) {
    console.error('Talepler alınamadı:', error);
    res.status(500).json({ message: 'Talepler alınamadı.', error });
  }
};

// 7 günden eski talepleri silmek için bir zamanlayıcı
const deleteOldRequests = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Request.deleteMany({ createdAt: { $lt: sevenDaysAgo } });
    console.log(`${result.deletedCount} eski talep silindi.`);
  } catch (error) {
    console.error('Eski talepler silinirken bir hata oluştu:', error);
  }
};

// Talep durumunu güncelleme
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Talep bulunamadı.' });
    }

    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu talebi güncelleme yetkiniz yok.' });
    }

    request.status = 'completed'; // Talebi tamamlandı olarak işaretle
    await request.save();

    res.status(200).json({ message: 'Talep başarıyla güncellendi.', request });
  } catch (error) {
    console.error('Talep güncellenirken hata:', error);
    res.status(500).json({ message: 'Talep güncellenirken hata oluştu.', error });
  }
};

// Her saat çalıştırmak için zamanlayıcı
setInterval(deleteOldRequests, 3600000); // 1 saat = 3600000 ms

module.exports = { createRequest, getRequests, deleteOldRequests, updateRequestStatus };
