require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Rotalar
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const challengeRoutes = require('./routes/challengeRoutes');

const app = express();

// Ortam Değişkenlerini Kontrol Et
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Hata: Gerekli ortam değişkenleri tanımlı değil!');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public dosyalar için statik yol
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ödeme rotası
app.use('/api/payments', paymentRoutes);

// Kullanıcı rotaları
app.use('/api/users', userRoutes);
app.use('/api/profile/user', profileRoutes); // Kullanıcı profilleri için
app.use('/api/reservations', reservationRoutes);
// Profil rotaları
app.use('/api/profile', profileRoutes); // Tüm profil rotalarını ekliyoruz.

// İşletme rotaları
app.use('/api/business', businessRoutes);
app.use('/api/profile/business', profileRoutes); // İşletme profilleri için
app.use('/api/reservations/business', reservationRoutes); // İşletme rezervasyonları
app.use('/api/tournaments', tournamentRoutes); // Turnuvalar
app.use('/api/challenges', challengeRoutes); // Challenge'lar

// API Test
app.get('/', (req, res) => res.send('API Çalışıyor!'));

// Global hata yönetimi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!', error: err.message });
});

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Sunucuyu başlat
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));