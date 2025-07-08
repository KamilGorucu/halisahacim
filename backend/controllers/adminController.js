const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Business = require("../models/Business");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const adminPayload = {
      id: 'admin123', // Rastgele bir ID (admin olarak tanınması için gerekli)
      role: "admin"
    };

    const token = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ token, role: "admin" });
  }
  res.status(401).json({ message: "Geçersiz kimlik bilgileri!" });
};

exports.getPendingBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ isApproved: false });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Bekleyen işletmeler alınırken hata oluştu.", error });
  }
};

exports.approveBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "İşletme bulunamadı." });
    }

    business.isApproved = true;
    business.isActive = true; // Admin onay verince aktif hale getir
    await business.save();

    res.json({ message: "İşletme onaylandı.", business });
  } catch (error) {
    res.status(500).json({ message: "Onay sırasında hata oluştu.", error });
  }
};

exports.rejectBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "İşletme bulunamadı." });
    }

    await Business.deleteOne({ _id: req.params.id }); // İşletmeyi sil

    res.json({ message: "İşletme reddedildi ve sistemden silindi." });
  } catch (error) {
    res.status(500).json({ message: "Reddetme sırasında hata oluştu.", error });
  }
};
