const Business = require('../models/Business');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * İşletme Kaydı
 */
 exports.registerBusiness = async (req, res) => {
  try {
    console.log('Gelen veri:', req.body);
    const { ownerName, businessName, email, password, location, workingHours, equipment } = req.body;

    if (!ownerName || !businessName || !email || !password || !location.coordinates || !workingHours) {
      return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newBusiness = new Business({
      ownerName,
      businessName,
      email,
      password: hashedPassword,
      location: {
        city: location.city || 'Belirtilmemiş', // Eğer şehir bilgisi yoksa varsayılan olarak "Belirtilmemiş"
        coordinates: location.coordinates,
      },
      workingHours,
      equipment,
      isActive: false,
    });

    await newBusiness.save();
    res.status(201).json({ message: 'İşletme kaydı başarılı!', business: newBusiness });
  } catch (error) {
    console.error('Backend Hatası:', error.message);
    res.status(500).json({ message: 'İşletme kaydı başarısız!', error: error.message });
  }
};

/**
 * İşletme Girişi
 */
exports.loginBusiness = async (req, res) => {
  const { email, password } = req.body;

  try {
    // İşletmeyi bul
    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı!' });
    }

    // Şifre doğrulaması yap
    const isPasswordValid = await bcrypt.compare(password, business.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz şifre!' });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: business._id, email: business.email, role: 'business' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Giriş başarılı!',
      token,
      role: 'business',
      isActive: business.isActive, // İşletmenin aktiflik durumu
      business: {
        id: business._id,
        name: business.businessName,
        email: business.email,
        location: business.location,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu!', error: error.message });
  }
};

/**
 * Halısaha Arama
 */
 exports.searchBusinesses = async (req, res) => {
  const { city } = req.query;

  try {
    const businesses = await Business.find({ "location.city": city, isActive: true }).select(
      "businessName location workingHours"
    );
    if (businesses.length === 0) {
      return res.status(404).json({ message: "Bu şehirde aktif işletme bulunamadı!" });
    }

    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: "İşletmeler aranırken bir hata oluştu.", error: error.message });
  }
};

/**
 * İşletme Detayı Getir
 */
exports.getBusinessById = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı!' });
    }

    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ message: 'İşletme detayları alınırken bir hata oluştu!', error: error.message });
  }
};

/**
 * Halısaha Listesi
 */
exports.listBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: 'İşletmeler listelenemedi!', error: error.message });
  }
};

/**
 * İşletme Fotoğrafı Yükleme
 */
exports.uploadPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Fotoğraf yüklenemedi!' });
  }
  res.status(200).json({ filePath: req.file.path });
};
