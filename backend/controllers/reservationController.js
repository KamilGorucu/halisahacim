const Reservation = require('../models/Reservation');
const Business = require('../models/Business');
const User = require('../models/User');
const Message = require('../models/Message'); // Mesaj modeli eklendi

const getAvailableSlots = async (req, res) => {
  try {
    const { date, businessId } = req.query;
    const userId = req.user._id; // Kullanıcının ID'si (JWT'den gelen)

    if (!date || !businessId) {
      return res.status(400).json({ message: 'Tarih ve işletme bilgisi gerekli.' });
    }

    const business = await Business.findById(businessId);
    if (!business || !business.fields || business.fields.length === 0) {
      return res.status(404).json({ message: 'Saha bilgisi bulunamadı.' });
    }

    const reservations = await Reservation.find({ date, business: businessId });

    const availability = business.fields.map((field) => ({
      fieldName: field.name,
      capacity: field.capacity,
      timeSlots: field.workingHours.map((slot) => {
        const reservation = reservations.find(
          (res) =>
            res.timeSlot === `${slot.start}-${slot.end}` &&
            res.fieldName === field.name
        );
        const isRequestingUser =
          reservation && reservation.user.email === req.user.email;

        return {
          timeSlot: `${slot.start}-${slot.end}`,
          isAvailable: !reservation || reservation.status === 'rejected' || (reservation.status === 'pending' && !isRequestingUser),
          status: isRequestingUser
            ? 'pending'
            : reservation
            ? reservation.status
            : 'available',
          userEmail: reservation ? reservation.user.email : null,
        };
      }),
    }));

    res.status(200).json({ date, slots: availability });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu.', error });
  }
};

// Kullanıcının belirli bir halısaha için haftalık rezervasyon sayısını kontrol etme fonksiyonu
const checkWeeklyReservationLimit = async (userId, businessId, date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Haftanın başlangıcı (Pazartesi)
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Haftanın sonu (Pazar)

  const count = await Reservation.countDocuments({
    user: userId,
    business: businessId,
    date: { $gte: startOfWeek, $lte: endOfWeek },
  });

  return count >= 3; // Kullanıcı 3 veya daha fazla rezervasyon yaptıysa true döner
};

const createReservation = async (req, res) => {
  try {
    const { userEmail, businessId, date, timeSlot, fieldName } = req.body;

    if (!userEmail || !businessId || !date || !timeSlot || !fieldName) {
      return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır!' });
    }

    const user = await User.findOne({ email: userEmail.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // Haftalık rezervasyon limitini kontrol et
    const hasReachedLimit = await checkWeeklyReservationLimit(user._id, businessId, date);
    if (hasReachedLimit) {
      return res.status(400).json({ message: 'Bir hafta içinde aynı halısaha için en fazla 3 rezervasyon yapabilirsiniz!' });
    }
    
    // Aynı kullanıcı için aynı tarih, saha ve saat diliminde rezervasyon kontrolü
    const existingReservation = await Reservation.findOne({
      user: user._id,
      business: businessId,
      date,
      timeSlot,
      fieldName,
    });

    if (existingReservation) {
      return res.status(400).json({
        message: 'Bu saat diliminde zaten bir rezervasyon isteğiniz bulunuyor!',
      });
    }

    const newReservation = new Reservation({
      user: user._id,
      business: businessId,
      date,
      timeSlot,
      fieldName,
      status: 'pending',
    });

    await newReservation.save();
    res.status(201).json({ message: 'Rezervasyon başarıyla oluşturuldu!', reservation: newReservation });
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyon oluşturulurken bir hata oluştu.', error });
  }
};

const getBusinessReservations = async (req, res) => {
  try {
    const businessId = req.businessId;

    if (!businessId) {
      return res.status(400).json({ message: 'İşletme ID gerekli.' });
    }

    const reservations = await Reservation.find({ business: businessId })
      .populate('user', 'fullName email')
      .populate('business', 'fields.name')
      .sort({ createdAt: -1 }); // En yeni istekler en üstte olacak şekilde sırala

    // Onaylı rezervasyonlar dahil edilerek döndürülüyor
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyonlar alınırken bir hata oluştu.', error });
  }
};

const approveReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: 'Rezervasyon ID gerekli.' });
    }

    const reservation = await Reservation.findById(reservationId).populate('user');
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    reservation.status = 'approved';
    await reservation.save();

    // Aynı tarih, saha ve saat için diğer rezervasyonları "rejected" yap
    await Reservation.updateMany(
      {
        business: reservation.business,
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        fieldName: reservation.fieldName,
        _id: { $ne: reservationId },
        status: 'pending',
      },
      { $set: { status: 'rejected' } }
      );
    
      // Onaylanan rezervasyon için kullanıcıya mesaj gönderme
    const user = await User.findById(reservation.user);
    if (user) {
      await Message.create({
        sender: reservation.business,
        senderModel: 'Business',
        receiver: user._id,
        receiverModel: 'User',
        content: 'Rezervasyonunuz Onaylandı! Sahaya vaktinde gelmeyi unutmayınız.',
      });
    }


    res.status(200).json({ message: 'Rezervasyon onaylandı!' });
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyon onaylanırken bir hata oluştu.', error });
  }
};

const rejectReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: 'Rezervasyon ID gerekli.' });
    }

    const reservation = await Reservation.findById(reservationId).populate('user');
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    reservation.status = 'rejected';
    await reservation.save();

    // Reddedilen rezervasyon için kullanıcıya mesaj gönderme
    const user = await User.findById(reservation.user);
    if (user) {
      await Message.create({
        sender: reservation.business,
        senderModel: 'Business',
        receiver: user._id,
        receiverModel: 'User',
        content: 'Rezervasyonunuz Reddedildi.',
      });
    }

    res.status(200).json({ message: 'Rezervasyon reddedildi!' });
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyon reddedilirken bir hata oluştu.', error });
  }
};

const getReservationSlots = async (req, res) => {
  try {
    const { date, businessId } = req.query;

    const business = await Business.findById(businessId);
    const timeSlots = business.workingHours.map((slot) => `${slot.start}-${slot.end}`);
    const reservations = await Reservation.find({ business: businessId, date });

    const slots = timeSlots.map((slot) => ({
      timeSlot: slot,
      isAvailable: !reservations.some((r) => r.timeSlot === slot),
    }));

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Saatler alınamadı.', error: error.message });
  }
};

const getWeeklyReservations = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID gerekli.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    const fields = business.fields;
    const reservations = await Reservation.find({
      business: businessId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate('user', 'fullName email');

    const weeklyData = fields.map((field) => {
      const timeSlots = field.workingHours.map((slot) => `${slot.start}-${slot.end}`);
      const weeklySlots = [];

      for (
        let d = new Date(startDate);
        d <= new Date(endDate);
        d.setDate(d.getDate() + 1)
      ) {
        const currentDate = new Date(d).toISOString().split('T')[0];

        const dayReservations = reservations.filter(
          (res) => res.date.toISOString().split('T')[0] === currentDate && res.fieldName === field.name
        );

        const daySlots = timeSlots.map((slot) => {
          const reservation = dayReservations.find((res) => res.timeSlot === slot);
          return {
            timeSlot: slot,
            isAvailable: !reservation || reservation.status === 'rejected',
            user: reservation && reservation.status === 'approved' ? reservation.user : null,
            status: reservation ? reservation.status : 'available',
          };
        });

        weeklySlots.push({ date: currentDate, daySlots });
      }

      return {
        fieldName: field.name,
        capacity: field.capacity,
        weeklyData: weeklySlots,
      };
    });

    res.status(200).json({ weeklyData });
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyonlar alınamadı.', error });
  }
};

module.exports = { 
  getAvailableSlots, 
  createReservation, 
  getBusinessReservations, 
  approveReservation, 
  rejectReservation, 
  getReservationSlots, 
  getWeeklyReservations,
  checkWeeklyReservationLimit
};
