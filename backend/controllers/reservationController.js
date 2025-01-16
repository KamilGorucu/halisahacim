const Reservation = require('../models/Reservation');
const Business = require('../models/Business');
const User = require('../models/User');

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

    // Tarihe göre saat aralıklarını filtrele
    const timeSlots = business.workingHours.map((slot) => `${slot.start}-${slot.end}`);
    const reservations = await Reservation.find({ date, business: businessId });

    const availability = timeSlots.map((slot) => {
      const isBooked = reservations.some((res) => res.timeSlot === slot);
      return { timeSlot: slot, isAvailable: !isBooked };
    });

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

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    // Onaylanan rezervasyonu güncelle
    reservation.status = 'approved';
    await reservation.save();

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

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    // Reddedilen rezervasyonu güncelle
    reservation.status = 'rejected';
    await reservation.save();

    res.status(200).json({ message: 'Rezervasyon reddedildi!', timeSlot: reservation.timeSlot });
  } catch (error) {
    console.error('Hata (rejectReservation):', error);
    res.status(500).json({ message: 'Rezervasyon reddedilirken bir hata oluştu.', error });
  }
};


module.exports = { getAvailableSlots, createReservation, getBusinessReservations, approveReservation, rejectReservation };
