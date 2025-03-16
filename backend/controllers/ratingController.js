const User = require('../models/User');

const rateUser = async (req, res) => {
  try {
    const { userId, score } = req.body;
    
    if (!userId || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Geçersiz puanlama isteği!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // ⭐ Rating Hesaplama ⭐
    user.rating.totalScore += score;
    user.rating.ratingCount += 1;
    
    await user.save();
    
    res.status(200).json({
      message: 'Kullanıcı başarıyla puanlandı!',
      averageRating: user.getAverageRating(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Puanlama sırasında hata oluştu!', error });
  }
};

module.exports = { rateUser };
