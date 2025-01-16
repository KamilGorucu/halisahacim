const Reservation = require('../models/Reservation');
const Business = require('../models/Business');

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

    const timeSlots = business.workingHours; // İşletme saat aralıklarını al
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

module.exports = { getAvailableSlots };
