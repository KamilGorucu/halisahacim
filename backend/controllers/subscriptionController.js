const SubscriptionRequest = require('../models/SubscriptionRequest');
const Reservation = require('../models/Reservation');
const Message = require('../models/Message');

exports.createSubscriptionRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { businessId, dayOfWeek, timeSlot, fieldName } = req.body;

    if (!businessId || !dayOfWeek || !timeSlot || !fieldName) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir!' });
    }

    
    const business = await require('../models/Business').findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }
    
    const selectedField = business.fields.find(f => f.name === fieldName);
    if (!selectedField) {
      return res.status(400).json({ message: 'Seçilen saha işletmede bulunamadı.' });
    }
    
    const isValidSlot = selectedField.workingHours.some(slot => `${slot.start}-${slot.end}` === timeSlot);
    if (!isValidSlot) {
      return res.status(400).json({ message: 'Seçilen saat aralığı bu saha için uygun değil.' });
    }

    // ❗ Zaten bu saat ve gün için başka bir istekte bulunulmuş mu?
    const conflict = await SubscriptionRequest.findOne({
      business: businessId,
      fieldName,
      dayOfWeek,
      timeSlot,
      status: { $in: ['pending', 'approved'] },
    });
    
    if (conflict) {
      return res.status(400).json({ message: 'Bu gün ve saat dilimi için zaten bir abonelik isteği var.' });
    }
    
    const existing = await SubscriptionRequest.findOne({ user: userId, business: businessId });
    if (existing) {
      return res.status(400).json({ message: 'Bu işletmeye zaten bir abonelik isteği gönderdiniz.' });
    }

    const newRequest = await SubscriptionRequest.create({
      user: userId,
      business: businessId,
      fieldName,
      dayOfWeek,
      timeSlot,
    });

    res.status(201).json({ message: 'Abonelik isteği gönderildi ✅', request: newRequest });
  } catch (error) {
    console.error('Abonelik isteği oluşturulurken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

exports.getBusinessSubscriptionRequests = async (req, res) => {
  try {
    const businessId = req.businessId;
    const requests = await SubscriptionRequest.find({ business: businessId })
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    console.error('Abonelik istekleri alınamadı:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

function getNextDateForDay(dayOfWeek, offset = 0) {
  const daysMap = {
    'Pazar': 0,
    'Pazartesi': 1,
    'Salı': 2,
    'Çarşamba': 3,
    'Perşembe': 4,
    'Cuma': 5,
    'Cumartesi': 6,
  };

  const today = new Date();
  const day = daysMap[dayOfWeek];

  if (day === undefined) {
    console.error(`Geçersiz gün adı: ${dayOfWeek}`);
    return null;
  }
  const result = new Date(today);
  result.setDate(result.getDate() + ((7 + day - today.getDay()) % 7) + (offset * 7));
  result.setHours(0, 0, 0, 0);
  return result;
}

exports.approveSubscriptionRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await SubscriptionRequest.findById(requestId).populate('user').populate('business');
    if (!request) return res.status(404).json({ message: 'İstek bulunamadı.' });

    request.status = 'approved';
    await request.save();

    for (let i = 0; i < 52; i++) {
      const date = getNextDateForDay(request.dayOfWeek, i);
      await Reservation.create({
        user: request.user,
        business: request.business,
        date,
        timeSlot: request.timeSlot,
        fieldName: request.fieldName,
        status: 'approved',
        isRecurring: true,
        fromSubscription: request._id,
      });
    }

    // Kullanıcıya mesaj gönder
    const messageContent = `Tebrikler! ${request.business.businessName} işletmesindeki "${request.fieldName}" sahası için her ${request.dayOfWeek} günü ${request.timeSlot} saatinde abonelik rezervasyonunuz onaylandı!`;

    await Message.create({
      sender: request.business._id,
      senderModel: 'Business',
      receiver: request.user._id,
      receiverModel: 'User',
      content: messageContent,
    });

    res.status(200).json({ message: 'Abonelik onaylandı ve rezervasyonlar oluşturuldu.' });
  } catch (error) {
    console.error('Abonelik onaylama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    const subscription = await SubscriptionRequest.findById(subscriptionId).populate('user').populate('business');
    if (!subscription) return res.status(404).json({ message: 'Abonelik bulunamadı.' });

    // İlgili aboneliğe ait gelecekteki tüm rezervasyonları sil (isRecurring && eşleşen subscription)
    const now = new Date();
    await Reservation.deleteMany({
      fromSubscription: subscription._id,
      isRecurring: true,
      date: { $gte: now },
    });

    // Kullanıcıya mesaj gönder
    const messageContent = `Bilgilendirme: ${subscription.business.businessName} işletmesindeki "${subscription.fieldName}" sahası için ${subscription.dayOfWeek} günü ${subscription.timeSlot} saatindeki abonelik rezervasyonunuz iptal edildi.`;

    await Message.create({
      sender: subscription.business._id,
      senderModel: 'Business',
      receiver: subscription.user._id,
      receiverModel: 'User',
      content: messageContent,
    });

    await subscription.deleteOne();

    res.status(200).json({ message: 'Abonelik ve ilgili rezervasyonlar iptal edildi.' });
  } catch (error) {
    console.error('Abonelik iptali hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

exports.rejectSubscriptionRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await SubscriptionRequest.findById(requestId).populate('user').populate('business');
    if (!request) return res.status(404).json({ message: 'İstek bulunamadı.' });

    request.status = 'rejected';
    await request.save();

    // Kullanıcıya mesaj gönder
    const messageContent = `Üzgünüz! ${request.business.businessName} işletmesindeki "${request.fieldName}" sahası için ${request.dayOfWeek} günü ${request.timeSlot} saatinde yaptığınız abonelik başvurusu reddedildi.`;

    await Message.create({
      sender: request.business._id,
      senderModel: 'Business',
      receiver: request.user._id,
      receiverModel: 'User',
      content: messageContent,
    });

    res.status(200).json({ message: 'Abonelik isteği reddedildi.' });
  } catch (error) {
    console.error('Abonelik reddetme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};