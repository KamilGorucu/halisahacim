const Challenge = require('../models/Challenge');

// İlan oluştur
exports.createChallenge = async (req, res) => {
  const { type, details, contactInfo } = req.body;

  try {
    const challenge = new Challenge({
      creator: req.user.id,
      type,
      details,
      contactInfo,
    });

    await challenge.save();
    res.status(201).json({ message: 'İlan başarıyla oluşturuldu!', challenge });
  } catch (error) {
    res.status(500).json({ message: 'İlan oluşturulamadı.', error: error.message });
  }
};

// İlanları listele
exports.getChallenges = async (req, res) => {
  const { type } = req.query;

  try {
    const challenges = await Challenge.find(type ? { type } : {}).populate('creator', 'fullName');
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'İlanlar alınamadı.', error: error.message });
  }
};
