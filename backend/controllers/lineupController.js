const Lineup = require('../models/Lineup');

// Kullanıcının tüm kadrolarını getir
exports.getUserLineups = async (req, res) => {
    const { userId } = req.params;

    try {
      const lineups = await Lineup.find({ owner: userId })
      .populate('players.player', 'fullName photo position fifaStats foot');
      res.status(200).json(lineups);
    } catch (error) {
      console.error('Kadro alınamadı:', error);
      res.status(500).json({ message: 'Kadro alınamadı.', error: error.message });
    }
};

// Yeni kadro oluştur
exports.createLineup = async (req, res) => {
    const { name, players } = req.body;
  
    if (!name || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ message: 'İsim ve oyuncular gereklidir.' });
    }
  
    // players dizisindeki her öğenin player + position içermesi kontrol edilir
    const isValid = players.every(p => p.player && p.position && typeof p.x === 'number' && typeof p.y === 'number');
    if (!isValid) {
      return res.status(400).json({ message: 'Tüm oyuncular için player ve position zorunludur.' });
    }
  
    try {
      const newLineup = new Lineup({
        name,
        owner: req.user.id,
        players,
      });
  
      await newLineup.save();
      res.status(201).json({ message: 'Kadro oluşturuldu.', lineup: newLineup });
    } catch (err) {
      res.status(500).json({ message: 'Kadro oluşturulamadı.', error: err.message });
    }
  };

// Kadro güncelle
exports.updateLineup = async (req, res) => {
  const { id } = req.params;
  const { name, players } = req.body;

  try {
    const lineup = await Lineup.findById(id);
    if (!lineup) return res.status(404).json({ message: 'Kadro bulunamadı.' });

    if (lineup.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu kadroya erişim yetkiniz yok.' });
    }

    if (name) lineup.name = name;
    if (Array.isArray(players)) lineup.players = players;

    await lineup.save();
    res.status(200).json({ message: 'Kadro güncellendi.', lineup });
  } catch (err) {
    res.status(500).json({ message: 'Güncelleme sırasında hata oluştu.', error: err.message });
  }
};

// Kadro sil
exports.deleteLineup = async (req, res) => {
  const { id } = req.params;

  try {
    const lineup = await Lineup.findById(id);
    if (!lineup) return res.status(404).json({ message: 'Kadro bulunamadı.' });

    if (lineup.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu kadroya erişim yetkiniz yok.' });
    }

    await lineup.deleteOne();
    res.status(200).json({ message: 'Kadro silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Silme sırasında hata oluştu.', error: err.message });
  }
};
