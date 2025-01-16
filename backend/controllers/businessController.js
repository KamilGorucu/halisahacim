const Business = require('../models/Business');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * İşletme Kaydı
 */
 exports.registerBusiness = async (req, res) => {
  try {
    console.log('Gelen veri:', req.body);

    // Verileri temizle ve normalize et
    const { ownerName, businessName, email, password, location, workingHours, equipment } = req.body;
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedWorkingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;

    // E-posta ve şifre gibi verileri normalize et
    const normalizedEmail = email.trim().toLowerCase().replace(/['"]+/g, '');
    const cleanedPassword = password.replace(/['"]+/g, '');
    const cleanedOwnerName = ownerName.replace(/['"]+/g, '');
    const cleanedBusinessName = businessName.replace(/['"]+/g, '');
    const cleanedEquipment = equipment.replace(/['"]+/g, '');

    if (
      !cleanedOwnerName ||
      !cleanedBusinessName ||
      !normalizedEmail ||
      !cleanedPassword ||
      !parsedLocation.coordinates ||
      !parsedWorkingHours
    ) {
      return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır!' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanedPassword, salt);

    const newBusiness = new Business({
      ownerName: cleanedOwnerName,
      businessName: cleanedBusinessName,
      email: normalizedEmail,
      password: hashedPassword,
      location: {
        city: parsedLocation.city || 'Belirtilmemiş',
        coordinates: parsedLocation.coordinates,
      },
      workingHours: parsedWorkingHours,
      equipment: cleanedEquipment,
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
    // Verileri temizle ve normalize et
    const normalizedEmail = email.trim().toLowerCase().replace(/['"]+/g, '');
    const cleanedPassword = password.replace(/['"]+/g, '');
    console.log('Normalized Email:', normalizedEmail);

    // İşletmeyi bul
    const business = await Business.findOne({ email: normalizedEmail });
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı!' });
    }

    // Şifre doğrulaması yap
    console.log('Kullanıcı Şifresi:', cleanedPassword);
    console.log('Hashlenmiş Şifre:', business.password);
    const isPasswordValid = await bcrypt.compare(cleanedPassword, business.password);
    if (!isPasswordValid) {
      console.log('Şifre doğrulaması başarısız.');
      return res.status(401).json({ message: 'Geçersiz şifre!' });
    }

    console.log('Şifre doğrulaması başarılı.');

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
      isActive: business.isActive,
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

  if (!city) {
    return res.status(400).json({ message: 'Şehir bilgisi gereklidir!' });
  }

  try {
    // Şehir adını normalize et
    const normalizedCity = city.toLowerCase().trim();

    const businesses = await Business.find({
      "location.city": { $regex: new RegExp(`^${normalizedCity}$`, 'i') },
      isActive: true,
    }).select('businessName location workingHours');

    if (businesses.length === 0) {
      return res.status(404).json({ message: 'Bu şehirde aktif işletme bulunamadı!' });
    }

    res.status(200).json(businesses);
  } catch (error) {
    console.error('Hata (searchBusinesses):', error.message);
    res.status(500).json({ message: 'İşletmeler aranırken bir hata oluştu.', error: error.message });
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
