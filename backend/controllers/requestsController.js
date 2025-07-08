// controllers/requestsController.js
const Request = require('../models/Request');
const User = require('../models/User');
const Lineup = require('../models/Lineup');

// Yeni talep oluştur
const createRequest = async (req, res) => {
  try {
    const { type, teamSize, lineupId, position, positionNeeded, description, location } = req.body;

    if (!location || !location.city) {
      return res.status(400).json({ message: 'Şehir bilgisi gereklidir.' });
    }

    // Rakip Bul ilanıysa kadroyu kontrol et
    if (type === 'findOpponent') {
      if (!lineupId) return res.status(400).json({ message: 'Kadro seçimi zorunludur.' });

      const lineup = await Lineup.findById(lineupId);
      if (!lineup) return res.status(404).json({ message: 'Kadro bulunamadı.' });

      if (lineup.players.length !== parseInt(teamSize)) {
        return res.status(400).json({ message: 'Takım boyutu kadroyla uyuşmuyor.' });
      }
    }

    // 🔒 Aynı anda açık ilan kontrolü
    const openRequestExists = await Request.exists({ user: req.user.id, status: 'open' });
    if (openRequestExists) {
      return res.status(400).json({ message: 'Mevcut açık bir ilanınız varken yeni bir ilan oluşturamazsınız.' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let limit = 5; // default sınır

    if (type === 'findTeam' && position === 'Kaleci') {
      limit = 14; // Kaleciler için daha yüksek sınır
    }

      const recentCount = await Request.countDocuments({
        user: req.user.id,
        type,
        createdAt: { $gte: sevenDaysAgo },
      });
        
      if (recentCount >= 5) {
        return res.status(429).json({ message: 'Haftalık maksimum talep sınırına ulaşıldı (5).' });
      }

    const newRequest = new Request({
      user: req.user.id,
      type,
      location, // Şehir bilgisi frontend'den alınır
      teamSize: type === 'findOpponent' ? teamSize : undefined,
      lineupId: type === 'findOpponent' ? lineupId : undefined,
      position: type === 'findTeam' ? position : undefined,  // Eğer ilan 'findTeam' ise mevkiyi kaydet
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
    const { type, city, positionNeeded, position, teamSize } = req.query; // Şehir ve talep türü bilgisi alınıyor

    if (!type || !city) {
      return res.status(400).json({ message: 'Tür ve şehir bilgisi gereklidir.' });
    }
    
    const filter = {
      type,
      'location.city': city,
      status: 'open',
    };

    if (type === 'findPlayer' && positionNeeded) {
      filter.positionNeeded = positionNeeded;
    }

    if (type === 'findTeam' && position) {
      filter.position = position;
    }

    if (type === 'findOpponent' && teamSize) {   // 🔥 EKLENDİ
      filter.teamSize = parseInt(teamSize);      // 🔥 string → int dönüşümü
    }

    const requests = await Request.find(filter)
      .populate('user', 'fullName position photo fifaStats foot')
      .populate('lineupId') // kadroyu da getir
      .sort({ createdAt: -1 });

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

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

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
    const { matchedUser, matchDate } = req.body;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Talep bulunamadı.' });
    }

    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu talebi güncelleme yetkiniz yok.' });
    }
    
    request.status = 'matched';
    request.matchedUser = matchedUser;
    request.matchDate = matchDate;

    await request.save();

    res.status(200).json({ message: 'Talep başarıyla güncellendi.', request });
  } catch (error) {
    console.error('Talep güncellenirken hata:', error);
    res.status(500).json({ message: 'Talep güncellenirken hata oluştu.', error });
  }
};

// Tekil talebi getir
const getSingleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Talep bulunamadı.' });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error('Tekil talep alınamadı:', error);
    res.status(500).json({ message: 'Talep alınırken hata oluştu.', error });
  }
};

// Her saat çalıştırmak için zamanlayıcı
setInterval(deleteOldRequests, 3600000); // 1 saat = 3600000 ms

module.exports = { createRequest, getRequests, deleteOldRequests, updateRequestStatus, getSingleRequest };
