const Business = require('../models/Business');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyRecaptcha = require('../middleware/recaptchaMiddleware');
const sendEmail = require('../utils/sendEmail');
/**
 * İşletme Kaydı
 */
exports.registerBusiness = async (req, res) => {
  try {
    // await verifyRecaptcha(req, res, async () => {
    console.log('Gelen veri:', req.body);

    // Gelen verileri temizle ve parse et
    const { ownerName, businessName, email, password, location, fields, equipment } = req.body;

    const existingBusiness = await Business.findOne({ email });
      if (existingBusiness) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı!' });
      }

    // Gelen string verilerdeki çift tırnakları temizle
    const cleanString = (str) => (typeof str === 'string' ? str.replace(/^"|"$/g, '').trim() : str);

    const cleanedCity = parsedLocation.city.charAt(0).toUpperCase() + parsedLocation.city.slice(1).toLowerCase();
    const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;

    // Alanları temizle
    const cleanedOwnerName = cleanString(ownerName);
    const cleanedBusinessName = cleanString(businessName);
    const cleanedEmail = cleanString(email)?.toLowerCase();
    const cleanedPassword = cleanString(password);
    const cleanedEquipment = cleanString(equipment);

    // Fotoğrafları yükle
    const photos = req.files?.map((file) => file.path) || [];

    // Tüm alanların doldurulduğundan emin olun
    if (
      !cleanedOwnerName ||
      !cleanedBusinessName ||
      !cleanedEmail ||
      !cleanedPassword ||
      !cleanedCity.coordinates ||
      !parsedFields ||
      parsedFields.length === 0
    ) {
      return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır!' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanedPassword, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const newBusiness = new Business({
      ownerName: cleanedOwnerName,
      businessName: cleanedBusinessName,
      email: cleanedEmail,
      password: hashedPassword,
      location: {
        city: cleanedCity.city || 'Belirtilmemiş',
        coordinates: parsedLocation.coordinates,
      },
      fields: parsedFields,
      equipment: cleanedEquipment,
      photos,
      isActive: false,
      isApproved: false,
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 30)), // İlk ödeme tarihi
      verificationCode,
    });

    await newBusiness.save();

    // Telefon ve e-posta doğrulama kodları gönder
    await sendEmail(email, 'E-posta Doğrulama Kodu', `Doğrulama Kodunuz: ${verificationCode}`);
    
    res.status(201).json({ message: 'İşletme kaydı başarılı!', business: newBusiness });
  // })
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
    const cleanedPassword = password.replace(/['"]+/g, '').trim();
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
      { id: business._id, 
        email: business.email, 
        role: 'business',
        isActive: business.isActive, // isActive burada encode edilmeli 
      },
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
   const decodedCity = decodeURIComponent(city.trim()); // URL encoding'i düzelt
   const normalizedCity = decodedCity.charAt(0).toUpperCase() + decodedCity.slice(1).toLowerCase(); // İlk harfi büyük yap

   console.log('Aranan şehir:', normalizedCity);

    const businesses = await Business.find({
      "location.city": { $regex: `^${normalizedCity}$`, $options: "i" }, // Büyük küçük harf duyarsız regex
      isActive: true,
      isApproved: true,
    }) 
    .sort({ averageRating: -1 }) // Ortalama puana göre azalan sırada sıralama
    .select('businessName location fields photos equipment price ratings averageRating')
    .populate({
      path: 'ratings.user',
      select: 'fullName email',
      options: { limit: 3 },
    });

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
 * İşletme Detaylarını Güncelle (Saha bilgileri + Çalışma Saatleri)
 */
 exports.updateBusinessDetails = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { fields } = req.body;

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'Saha bilgileri gerekli.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    // Güncellenmiş saha bilgilerini kaydet
    business.fields = fields;

    await business.save();
    res.status(200).json({ message: 'İşletme detayları güncellendi.', business });
  } catch (error) {
    console.error('Hata (updateBusinessDetails):', error.message);
    res.status(500).json({ message: 'İşletme detayları güncellenemedi.', error });
  }
};

/**
 * İşletme Detayı Getir
 */
exports.getBusinessById = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await Business.findById(id)
      .populate('ratings.user', 'fullName email'); // Kullanıcı adını yorumlarla beraber getir

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
    const businesses = await Business.find({ isApproved: true, isActive: true })
      .sort({ averageRating: -1 }) // Ortalama puana göre azalan sırada sıralama
      .select('businessName location fields photos equipment price ratings averageRating');
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

/**
 * İşletmeye Yorum ve Puan Ekleme
 */
 exports.addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Geçerli bir puan girin (1-5 arası).' });
    }

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı.' });
    }

    // Kullanıcı doğrulaması
    if (!req.user) {
      return res.status(401).json({ message: 'Yetkisiz erişim, kullanıcı doğrulanamadı.' });
    }

    // Yorum ve puan ekle
    business.ratings.push({
      user: req.user._id, // Kullanıcının ID'sini buraya ekle
      rating,
      comment,
    });

    // Ortalama puanı yeniden hesapla
    const totalRatings = business.ratings.length;
    const averageRating = business.ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings;
    business.averageRating = averageRating;

    await business.save();

    res.status(200).json({ message: 'Yorum ve puan başarıyla eklendi.', business });
  } catch (error) {
    console.error('Puan ve yorum ekleme hatası:', error);
    res.status(500).json({ message: 'Yorum ve puan eklenemedi.', error: error.message });
  }
};

/**
 * İşletme Onayı - Admin tarafından işletme onaylanması
 */
 exports.approveBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı!' });
    }
    
    business.isApproved = true;
    business.isActive = true; // ✔ İşletme artık görünür olacak

    await business.save();
    res.status(200).json({ message: 'İşletme başarıyla onaylandı!', business });
  } catch (error) {
    console.error('İşletme onay hatası:', error);
    res.status(500).json({ message: 'İşletme onaylanamadı!', error: error.message });
  }
};