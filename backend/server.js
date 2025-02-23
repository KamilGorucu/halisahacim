require('dotenv').config();
require('./controllers/requestsController'); // Zamanlayıcı otomatik çalışır
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { ipBlacklist } = require('./middleware/ipBlacklistMiddleware');

// Rotalar
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const messageRoutes = require('./routes/messageRoutes'); // Mesaj rotaları
const requestsRoutes = require('./routes/requestsRoutes');

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

// Rotalar
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/profile/user', profileRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/business', businessRoutes);
// app.use('/api/profile/business', profileRoutes);
app.use('/api/reservations/business', reservationRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/messages', messageRoutes); // Mesaj rotaları
app.use('/api/requests', requestsRoutes);

app.use(ipBlacklist); // Tüm API isteklerinde IP kontrolü yap
// API Test
app.get('/', (req, res) => res.send('API Çalışıyor!'));

// Hata yönetimi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!', error: err.message });
});

// MongoDB Bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Socket.IO entegrasyonu
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Aktif kullanıcılar
let activeUsers = {};

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);

  // Kullanıcı giriş yapınca
  socket.on('join', ({ userId }) => {
    activeUsers[userId] = socket.id;
    console.log('Aktif Kullanıcılar:', activeUsers);
  });

  // Mesaj gönderme
  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    const receiverSocketId = activeUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', { senderId, content });
      console.log('Mesaj iletildi:', { senderId, receiverId, content });
    }
  });

  // Kullanıcı ayrıldığında
  socket.on('disconnect', () => {
    for (const [userId, socketId] of Object.entries(activeUsers)) {
      if (socketId === socket.id) {
        delete activeUsers[userId];
        console.log('Kullanıcı ayrıldı:', userId);
      }
    }
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));
