const Reservation = require('../models/Reservation');
const Business = require('../models/Business');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

const getAvailableSlots = async (req, res) => {
  try {
    const { date, businessId } = req.query;

    if (!date || !businessId) {
      return res.status(400).json({ message: 'Tarih ve işletme bilgisi gerekli.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    const reservations = await Reservation.find({ date, business: businessId });

    const availability = business.fields.map((field) => ({
      fieldName: field.name,
      capacity: field.capacity,
      timeSlots: field.workingHours.map((slot) => {
        const approved = reservations.some(
          (res) => res.timeSlot === `${slot.start}-${slot.end}` && res.status === 'approved'
        );
        return { timeSlot: `${slot.start}-${slot.end}`, isAvailable: !approved };
      }),
    }));

    res.status(200).json({ date, slots: availability });
  } catch (error) {
    console.error('Hata: getAvailableSlots sırasında bir hata oluştu:', error);
    res.status(500).json({ message: 'Bir hata oluştu.', error });
  }
};

const createReservation = async (req, res) => {
  try {
    const { userEmail, businessId, date, timeSlot } = req.body;
    console.log('Gelen veri:', req.body);

    if (!userEmail || !businessId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır!' });
    }

    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // Rezervasyon oluştur
    const newReservation = new Reservation({
      user: user._id,
      business: businessId,
      date,
      timeSlot,
      status: 'pending',
    });

    await newReservation.save();
    res.status(201).json({ message: 'Rezervasyon başarıyla oluşturuldu!', reservation: newReservation });
  } catch (error) {
    console.error('Hata (createReservation):', error);
    res.status(500).json({ message: 'Rezervasyon oluşturulurken bir hata oluştu.', error: error.message });
  }
};

const getBusinessReservations = async (req, res) => {
  try {
    const businessId = req.businessId; // Token'dan gelen işletme ID'si

    if (!businessId) {
      return res.status(400).json({ message: 'İşletme ID gerekli.' });
    }

    const reservations = await Reservation.find({ business: businessId }).populate('user', 'fullName email');
    res.status(200).json({ reservations });
  } catch (error) {
    console.error('Hata (getBusinessReservations):', error);
    res.status(500).json({ message: 'Rezervasyonlar alınırken bir hata oluştu.', error });
  }
};

const approveReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: 'Rezervasyon ID gerekli.' });
    }

    const reservation = await Reservation.findById(reservationId).populate('user', 'email fullName');
    if (!reservation || !reservation.user) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    // Onaylanan rezervasyonu güncelle
    reservation.status = 'approved';
    await reservation.save();

    // Aynı saat aralığındaki diğer bekleyen rezervasyonları reddet
    await Reservation.updateMany(
      {
        business: reservation.business,
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        status: 'pending',
        _id: { $ne: reservationId }, // Onaylanan rezervasyonu hariç tut
      },
      { $set: { status: 'rejected' } }
    );

    // Kullanıcıya e-posta gönder
    await sendEmail(
      reservation.user.email,
      'Rezervasyon Onaylandı',
      `Merhaba ${reservation.user.fullName},\n\nRezervasyonunuz onaylandı!\n\nTarih: ${reservation.date.toLocaleDateString()}\nSaat: ${reservation.timeSlot}\n\nİyi günler dileriz.`
    );

    res.status(200).json({ message: 'Rezervasyon onaylandı!', timeSlot: reservation.timeSlot });
  } catch (error) {
    console.error('Hata (approveReservation):', error);
    res.status(500).json({ message: 'Rezervasyon onaylanırken bir hata oluştu.', error });
  }
};

const rejectReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: 'Rezervasyon ID gerekli.' });
    }

    const reservation = await Reservation.findById(reservationId).populate('user', 'email fullName');
    if (!reservation || !reservation.user) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    // Reddedilen rezervasyonu güncelle
    reservation.status = 'rejected';
    await reservation.save();

     // Kullanıcıya e-posta gönder
     await sendEmail(
      reservation.user.email,
      'Rezervasyon Reddedildi',
      `Merhaba ${reservation.user.fullName},\n\nÜzgünüz, rezervasyonunuz reddedildi.\n\nTarih: ${reservation.date.toLocaleDateString()}\nSaat: ${reservation.timeSlot}\n\nAnlayışınız için teşekkür ederiz.`
    );

    res.status(200).json({ message: 'Rezervasyon reddedildi!', timeSlot: reservation.timeSlot });
  } catch (error) {
    console.error('Hata (rejectReservation):', error);
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
      console.error('Business ID null geldi.');
      return res.status(400).json({ message: 'Business ID gerekli.' });
    }

    console.log('getWeeklyReservations - Gelen Veriler:', { businessId, startDate, endDate });

    const business = await Business.findById(businessId);
    if (!business) {
      console.error(`İşletme bulunamadı: ${businessId}`);
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    console.log('Working Hours:', business.workingHours);

    const reservations = await Reservation.find({
      business: businessId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: 'approved', // Yalnızca onaylanmış rezervasyonları al
    }).populate('user', 'fullName email');

    console.log('Approved Reservations:', reservations);
    const timeSlots = business.workingHours.map((slot) => `${slot.start}-${slot.end}`);
    const weeklyData = [];

    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d).toDateString();

      const dayReservations = reservations.filter(
        (res) => new Date(res.date).toDateString() === currentDate
      );

      const daySlots = timeSlots.map((slot) => {
        const reservation = dayReservations.find((res) => res.timeSlot === slot);
        return {
          timeSlot: slot,
          isAvailable: !reservation, // Sadece onaylı rezervasyonlar dolu gösterilir
          user: reservation ? reservation.user : null,
        };
      });

      weeklyData.push({
        date: currentDate,
        daySlots,
      });
    }

    console.log('Generated Weekly Data:', weeklyData);
    res.status(200).json({ weeklyData });
  } catch (error) {
    console.error('Hata (getWeeklyReservations):', error);
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
  getWeeklyReservations 
};
