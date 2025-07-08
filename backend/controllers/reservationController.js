const Reservation = require('../models/Reservation');
const Business = require('../models/Business');
const User = require('../models/User');
const Message = require('../models/Message'); // Mesaj modeli eklendi
const mongoose = require('mongoose');

const getAvailableSlots = async (req, res) => {
  try {
    const { date, businessId } = req.query;

    if (!date || !businessId) {
      return res.status(400).json({ message: 'Tarih ve işletme bilgisi gerekli.' });
    }

    const business = await Business.findById(businessId);
    if (!business || !business.fields || business.fields.length === 0) {
      return res.status(404).json({ message: 'Saha bilgisi bulunamadı.' });
    }

    // Bir sonraki gün
    const selectedDate = new Date(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 2);
    nextDate.setHours(0, 0, 0, 0);

    const reservations = await Reservation.find({
      business: businessId,
      date: selectedDate, // ✅ Tarihi doğru formatta filtrele
      status: 'approved', // ✅ Sadece onaylıları dahil et
    });

    const availability = business.fields.map((field) => {
      const timeSlots = field.workingHours.map((slot) => {
        const timeRange = `${slot.start}-${slot.end}`;

        const approvedReservation = reservations.find(
          (res) => res.timeSlot === timeRange && res.fieldName === field.name
        );

        return {
          timeSlot: timeRange,
          isAvailable: !approvedReservation,
          status: approvedReservation ? 'approved' : 'available',
          user: approvedReservation ? approvedReservation.user : null,
        };
      });

      return {
        fieldName: field.name,
        capacity: field.capacity,
        timeSlots,
      };
    });

    res.status(200).json({ date, slots: availability });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu.', error });
  }
};

const getWeeklyAvailableSlots = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;

    if (!businessId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Gerekli parametreler eksik.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    const fields = business.fields;
    const reservations = await Reservation.find({
      business: businessId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: 'approved'
    });

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
          const matchedReservation = dayReservations.find((res) => res.timeSlot === slot);

          return {
            timeSlot: slot,
            isAvailable: !matchedReservation,
            status: matchedReservation ? 'approved' : 'available'
          };
        });

        weeklySlots.push({ date: currentDate, daySlots });
      }

      return {
        fieldName: field.name,
        capacity: field.capacity,
        weeklyData: weeklySlots
      };
    });

    res.status(200).json({ weeklyData });
  } catch (error) {
    res.status(500).json({ message: 'Veriler alınırken hata oluştu.', error });
  }
};

// Kullanıcının belirli bir halısaha için haftalık rezervasyon sayısını kontrol etme fonksiyonu
const checkWeeklyReservationLimit = async (userId, businessId, date) => {
  const current = new Date(date);

  // Haftanın ilk günü Pazartesi olsun (Pazar yerine)
  const day = current.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day; // 0 (Pazar) ise -6, 1 (Pazartesi) ise 0, 2 ise -1...
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const count = await Reservation.countDocuments({
    user: userId,
    business: businessId,
    date: { $gte: startOfWeek, $lte: endOfWeek },
  });

  return count >= 3;
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

    // const sevenDaysAgo = new Date();
    // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reservations = await Reservation.find({ 
      business: businessId,
      // date: { $gte: sevenDaysAgo },
      $or: [
        { fromSubscription: { $exists: false } },
        { fromSubscription: null }
      ] // ❗ Abonelik rezervasyonlarını hariç tut 
    })
      .populate('user', 'fullName email phone')
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
    
      const user = await User.findById(reservation.user);
      if (user) {
        // Tarih ve saat bilgilerini al ve formatla
        const reservationDate = new Date(reservation.date);
        const formattedDate = new Intl.DateTimeFormat('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          weekday: 'long',
        }).format(reservationDate);
      
        const messageContent = `Rezervasyonunuz Onaylandı! ${formattedDate} tarihinde ${reservation.timeSlot} saatindeki rezervasyonunuza gelmeyi unutmayınız.`;
      
        await Message.create({
          sender: reservation.business,
          senderModel: 'Business',
          receiver: user._id,
          receiverModel: 'User',
          content: messageContent,
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

    // **Saat aralığını tekrar available yap**
    await Reservation.updateMany(
      {
        business: reservation.business,
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        fieldName: reservation.fieldName,
        status: 'available'
      },
      { $set: { status: 'available' } }
    );

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
          const matchedReservation =
            dayReservations.find((res) => res.timeSlot === slot && res.status === 'approved') ||
            dayReservations.find((res) => res.timeSlot === slot && res.status === 'pending') ||
            dayReservations.find((res) => res.timeSlot === slot && res.status === 'rejected');
        
          return {
            timeSlot: slot,
            isAvailable: !matchedReservation || matchedReservation.status === 'available',
            user: matchedReservation?.user || null,
            status: matchedReservation?.status || 'available',
            reservationId: matchedReservation?._id?.toString() || null, // ✅ BURASI EKLENDİ
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

const getDailyReservations = async (req, res) => {
  try {
    const { businessId, date } = req.query;

    if (!businessId || !date) {
      return res.status(400).json({ message: 'İşletme ID ve tarih gerekli.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    const reservations = await Reservation.find({
      business: businessId,
      date: new Date(date),
    }).populate('user', 'fullName email');

    const data = business.fields.map((field) => {
      const timeSlots = field.workingHours.map((slot) => `${slot.start}-${slot.end}`);

      const daySlots = timeSlots.map((slot) => {
        const matchedReservation =
          reservations.find((res) => res.timeSlot === slot && res.fieldName === field.name);

        return {
          timeSlot: slot,
          isAvailable: !matchedReservation,
          status: matchedReservation?.status || 'available',
          user: matchedReservation?.user || null,
          reservationId: matchedReservation?._id?.toString() || null,
        };
      });

      return {
        fieldName: field.name,
        capacity: field.capacity,
        daySlots,
      };
    });

    res.status(200).json({ date, dailyData: data });
  } catch (error) {
    res.status(500).json({ message: 'Günlük veriler alınamadı.', error });
  }
};

const deleteReservation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Geçersiz ID formatı.' });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    // Silinen rezervasyon bilgilerine göre eşleşen ama reddedilmiş olanları tekrar pending yap
    await Reservation.updateMany(
      {
        business: reservation.business,
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        fieldName: reservation.fieldName,
        status: 'rejected',
      },
      { $set: { status: 'pending' } }
    );

    await reservation.deleteOne();

    res.status(200).json({ message: 'Rezervasyon silindi ve saat tekrar kullanılabilir hale geldi.' });
  } catch (error) {
    console.error('❌ Silme hatası:', error);
    res.status(500).json({ message: 'Rezervasyon silinirken hata oluştu.', error });
  }
};

module.exports = { 
  getAvailableSlots, 
  getWeeklyAvailableSlots,
  createReservation, 
  getBusinessReservations, 
  approveReservation, 
  rejectReservation, 
  getReservationSlots, 
  getWeeklyReservations,
  getDailyReservations,
  checkWeeklyReservationLimit,
  deleteReservation
};
