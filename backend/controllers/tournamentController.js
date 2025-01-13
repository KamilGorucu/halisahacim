const Tournament = require('../models/Tournament');

// Turnuva oluştur
exports.createTournament = async (req, res) => {
  const { name, date, location, fee } = req.body;

  try {
    // Kullanıcının işletme sahibi olup olmadığını kontrol et
    if (req.user.role !== 'business') {
        return res.status(403).json({ message: 'Sadece işletme sahipleri turnuva oluşturabilir.' });
    }
    const tournament = new Tournament({
      name,
      date,
      location,
      fee,
      organizer: req.user.id,
    });

    await tournament.save();
    res.status(201).json({ message: 'Turnuva başarıyla oluşturuldu!', tournament });
  } catch (error) {
    res.status(500).json({ message: 'Turnuva oluşturulamadı.', error: error.message });
  }
};

// Turnuvaları listele
exports.getTournaments = async (req, res) => {
  const { city } = req.query;

  try {
    const tournaments = await Tournament.find(city ? { 'location.city': city } : {})
      .populate('organizer', 'fullName')
      .populate('participants', 'fullName');
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Turnuvalar alınamadı.', error: error.message });
  }
};

// Turnuvaya kayıt
exports.registerForTournament = async (req, res) => {
  const { tournamentId } = req.body;

  try {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: 'Turnuva bulunamadı.' });
    }

    if (tournament.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Zaten bu turnuvaya kayıtlısınız.' });
    }

    tournament.participants.push(req.user.id);
    await tournament.save();

    res.status(200).json({ message: 'Turnuvaya başarıyla kayıt oldunuz!', tournament });
  } catch (error) {
    res.status(500).json({ message: 'Turnuvaya kayıt olunamadı.', error: error.message });
  }
};
