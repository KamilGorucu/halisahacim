const Reservation = require('../models/Reservation');
const Business = require('../models/Business');

// Rezervasyon oluştur
exports.createReservation = async (req, res) => {
  const { businessId, date, timeSlot } = req.body;

  try {
    // İşletmeyi kontrol et
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    // Rezervasyon isteği oluştur
    const reservation = new Reservation({
      user: req.user.id,
      business: businessId,
      date,
      timeSlot,
    });

    await reservation.save();
    res.status(201).json({ message: 'Rezervasyon isteği gönderildi.', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyon oluşturulamadı.', error: error.message });
  }
};

// İşletme sahibine rezervasyon isteklerini getir
exports.getReservationsForBusiness = async (req, res) => {
  try {
    const reservations = await Reservation.find({ business: req.user.id })
      .populate('user', 'fullName email') // Kullanıcı bilgilerini ekle
      .sort({ date: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyonlar alınamadı.', error: error.message });
  }
};

// Kullanıcıya ait rezervasyonları getir
exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('business', 'businessName location')
      .sort({ date: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyonlar alınamadı.', error: error.message });
  }
};

// Rezervasyon durumunu güncelle (onayla/reddet)
exports.updateReservationStatus = async (req, res) => {
  const { reservationId, status } = req.body;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });
    }

    reservation.status = status;
    await reservation.save();
    res.status(200).json({ message: `Rezervasyon ${status} edildi.`, reservation });
  } catch (error) {
    res.status(500).json({ message: 'Rezervasyon durumu güncellenemedi.', error: error.message });
  }
};

function generateTimeSlots(open, close) {
  const slots = [];
  let current = new Date(`1970-01-01T${open}:00`);
  const end = new Date(`1970-01-01T${close}:00`);

  while (current < end) {
    const next = new Date(current.getTime() + 60 * 60 * 1000); // 1 saat ekle
    slots.push(`${current.toTimeString().slice(0, 5)}-${next.toTimeString().slice(0, 5)}`);
    current = next;
  }

  return slots;
}

exports.getAvailableTimeSlots = async (req, res) => {
  const { businessId, date } = req.query;

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    const { start, end } = business.workingHours;
    if (!start || !end) {
      return res.status(400).json({ message: 'İşletmenin çalışma saatleri belirlenmemiş.' });
    }

    const allSlots = generateTimeSlots(start, end);
    const reservations = await Reservation.find({ business: businessId, date: new Date(date).toISOString() });

    const reservedSlots = reservations.map((res) => res.timeSlot);
    const availableSlots = allSlots.map((slot) => ({
      timeSlot: slot,
      isAvailable: !reservedSlots.includes(slot),
    }));

    res.status(200).json({ slots: availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Saat aralıkları alınamadı.', error: error.message });
  }
};
