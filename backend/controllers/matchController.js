const mongoose = require('mongoose');
const Match = require('../models/Match');
const Request = require('../models/Request');

exports.createMatch = async (req, res) => {
  const { requestId, userA, userB, matchDate, matchLocation, hour, myLineupId, opponentLineupId } = req.body;

  try {
    let playersA = [];
    let playersB = [];
    let lineupA = null;
    let lineupB = null;

    const request = requestId ? await Request.findById(requestId) : null;
    const requestType = request?.type || null;

    // Sadece findOpponent (Rakip Bul) tipinde kadro kontrolü yap
    if (requestType === 'findOpponent') {
      const Lineup = require('../models/Lineup');
      const myLineup = await Lineup.findById(myLineupId);
      const opponentLineup = await Lineup.findById(opponentLineupId);

      if (!myLineup || !opponentLineup) {
        return res.status(400).json({ message: "Kadro(lar) bulunamadı." });
      }

      if (myLineup.players.length !== opponentLineup.players.length) {
        return res.status(400).json({ message: "Takım boyutları eşleşmiyor." });
      }

      const myPlayerIds = myLineup.players.map(p => p.player.toString());
      const opponentPlayerIds = opponentLineup.players.map(p => p.player.toString());

      const ortak = myPlayerIds.find(id => opponentPlayerIds.includes(id));
      if (ortak) {
        return res.status(400).json({ message: "Aynı oyuncu her iki takımda da yer alamaz." });
      }

      playersA = myPlayerIds;
      playersB = opponentPlayerIds;
      lineupA = myLineupId;
      lineupB = opponentLineupId;
    } else {
      // findPlayer / findTeam için: userA ve userB doğrudan playersA ve playersB olarak atanır
      playersA = [userA];
      playersB = [userB];
    }

    const match = new Match({
      requestId: requestId || undefined,
      users: [userA, userB],
      matchDate,
      matchLocation,
      hour,
      createdBy: req.user.id,
      playersA,
      playersB,
      lineupA,
      lineupB,
    });

    await match.save();

    if (request) {
      request.status = 'matched';
      request.matchedUser = userB;
      request.matchDate = matchDate;
      await request.save();
    }

    res.status(201).json({ message: 'Maç oluşturuldu', match });
  } catch (err) {
    console.error("Maç oluşturma hatası:", err);
    res.status(500).json({ message: "Maç oluşturulamadı", error: err.message });
  }
};

exports.getUserMatches = async (req, res) => {
    const { userId } = req.params;
    try {
      const matches = await Match.find({
        $or: [
          { users: userId },
          { playersA: userId },
          { playersB: userId }
        ]
      })
      .populate('users', 'fullName photo position')
      .populate('playersA', 'fullName photo position')
      .populate('playersB', 'fullName photo position');
      res.status(200).json(matches);
    } catch (err) {
      res.status(500).json({ message: "Maçlar getirilemedi", error: err.message });
    }
  };

exports.rateMatchStats = async (req, res) => {
    const { id } = req.params; // match id
    const { raterId, rateeId, ratings } = req.body; // { speed: 80, passing: 90, ... }
  
    try {
      if (!raterId || !rateeId || !ratings) {
        return res.status(400).json({ message: "Eksik parametre: raterId, rateeId veya ratings yok." });
      }
      
      const match = await Match.findById(id);
      if (!match) return res.status(404).json({ message: "Maç bulunamadı" });
      
      const allPlayers = [
        ...match.playersA.map(p => p.toString()),
        ...match.playersB.map(p => p.toString())
      ];
      
      if (!allPlayers.includes(raterId)) {
        return res.status(403).json({ message: "Bu maçta olmadığınız için puan veremezsiniz." });
      }      
  
      const now = new Date();
      if (new Date(match.matchDate) > now) {
        return res.status(403).json({ message: "Maç tarihi henüz geçmedi." });
      }
  
      const alreadyRated = match.ratingGiven.some(entry =>
        entry?.rater?.toString?.() === raterId && entry?.ratee?.toString?.() === rateeId
      );

      if (alreadyRated) {
        return res.status(400).json({ message: "Bu kullanıcı zaten bu kişiye puan verdi." });
      }
  
      const User = require('../models/User');
      const user = await User.findById(rateeId);
  
      const statKeys = ["speed", "shooting", "passing", "dribbling", "defense", "physical"];
      for (const key of statKeys) {
        if (typeof ratings[key] !== 'number' || ratings[key] < 0 || ratings[key] > 100) {
          return res.status(400).json({ message: `Geçersiz puan: ${key}` });
        }
        const old = user.fifaStats[key];
        const yeni = ratings[key];
        user.fifaStats[key] = Math.round((old + yeni) / 2);
      }
  
      await user.save();
      match.ratingGiven.push({ 
        rater: new mongoose.Types.ObjectId(raterId), 
        ratee: new mongoose.Types.ObjectId(rateeId) 
    });
      await match.save();
  
      res.status(200).json({ message: "Puanlama başarılı", updatedStats: user.fifaStats });
    } catch (err) {
      console.error("Puanlama başarısız detaylı:", err);
      res.status(500).json({ message: "Puanlama başarısız", error: err.message });
    }
};

exports.canUserRate = async (req, res) => {
    const { id, userId } = req.params;
    const match = await Match.findById(id);
    if (!match) return res.status(404).json({ message: "Maç yok" });
  
    const now = new Date();

    // Saat bilgisiyle birleştirilmiş maç tarihi:
    const fullMatchDateTime = new Date(`${match.matchDate.toISOString().split('T')[0]}T${match.hour}:00`);

    const isTimeValid = fullMatchDateTime < now;
    const alreadyRated = match.ratingGiven.includes(userId);
    const isParticipant = match.users.includes(userId);
  
    res.status(200).json({ canRate: isTimeValid && !alreadyRated && isParticipant });
};