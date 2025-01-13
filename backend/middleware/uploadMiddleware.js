const multer = require('multer');
const path = require('path');

// Yükleme Konumu ve Ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Fotoğrafların kaydedileceği klasör
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Benzersiz dosya adı oluştur
  },
});

const fileFilter = (req, file, cb) => {
  // Yalnızca resim dosyalarına izin ver
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyalarına izin verilir!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
