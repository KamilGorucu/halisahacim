const User = require('../models/User');
const Business = require('../models/Business');

/**
 * Kullanıcı Profili Getir
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı profili alınamadı.', error: error.message });
  }
};

/**
 * İşletme Profili Getir
 */
 exports.getBusinessProfile = async (req, res) => {
  try {
    const businessId = req.businessId; // Middleware'den gelen işletme ID

    if (!businessId) {
      return res.status(400).json({ message: 'İşletme ID gerekli.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    res.status(200).json(business);
  } catch (error) {
    console.error('Hata (getBusinessProfile):', error);
    res.status(500).json({ message: 'İşletme profili alınırken bir hata oluştu.', error });
  }
};

/**
 * İşletme Profil Güncelle
 */
exports.updateBusinessProfile = async (req, res) => {
  try {
    const { businessName, location, workingHours, equipment, price } = req.body;

    const updatedBusiness = await Business.findOneAndUpdate(
      { _id: req.user.id }, // İşletme sahibi ID'sine göre güncelle
      { businessName, location, workingHours, equipment, price },
      { new: true } // Yeni güncellenmiş veriyi döndür
    );

    if (!updatedBusiness) {
      return res.status(404).json({ message: 'İşletme bulunamadı!' });
    }

    res.status(200).json({ message: 'Profil başarıyla güncellendi.', business: updatedBusiness });
  } catch (error) {
    res.status(500).json({ message: 'Profil güncellenemedi!', error: error.message });
  }
};

/**
 * Kullanıcı Profil Güncelle
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, email, phone, teams, position } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, email, phone, teams, position },
      { new: true } // Yeni güncellenmiş veriyi döndür
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    res.status(200).json({ message: 'Profil başarıyla güncellendi.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Profil güncellenemedi!', error: error.message });
  }
};
