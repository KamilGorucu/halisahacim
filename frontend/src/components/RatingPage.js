import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import RatePlayerModal from './RatePlayerModal';
import { useNavigate } from 'react-router-dom';
import '../css/RatingPage.css';

const API_URL = process.env.REACT_APP_API_URL;

const RatingPage = () => {
  const { user } = useContext(AuthContext);
  const [matchToRate, setMatchToRate] = useState(null);
  const [rateCandidates, setRateCandidates] = useState([]);
  const [selectedRatee, setSelectedRatee] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleModalClose = (options) => {
    if (options?.refresh) {
      // Burada pencereyi komple yenilemek yerine yeniden fetch yaparsan daha iyi olur
      window.location.reload(); // Şimdilik hızlı çözüm
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/matches/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const now = new Date();
        const eligibleMatches = res.data.filter(match => {
          const matchDate = new Date(`${match.matchDate.split('T')[0]}T${match.hour}:00`);
          const playerTeam = match.playersA.some(p => p._id === user.id)
            ? 'A' : 'B';
          const opponents = playerTeam === 'A' ? match.playersB : match.playersA;
          const unratedOpponents = opponents.filter(opponent => {
            return !match.ratingGiven.some(entry =>
              entry.rater.toString() === user.id && entry.ratee.toString() === opponent._id
            );
          });
          return matchDate < now && unratedOpponents.length > 0;
        });

        if (eligibleMatches.length > 0) {
          const match = eligibleMatches[0];
          const playerTeam = match.playersA.some(p => p._id === user.id)
            ? 'A' : 'B';
          const opponents = playerTeam === 'A' ? match.playersB : match.playersA;
          const unratedOpponents = opponents.filter(opponent => {
            return !match.ratingGiven.some(entry =>
              entry.rater.toString() === user.id && entry.ratee.toString() === opponent._id
            );
          });

          setMatchToRate({ matchId: match._id, raterId: user.id });
          setRateCandidates(unratedOpponents);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error("Maçlar alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user, navigate]);

  const handleSelect = () => {
    if (!selectedRatee) {
      alert("Lütfen bir oyuncu seçin.");
      return;
    }
    setMatchToRate(prev => ({ ...prev, rateeId: selectedRatee }));
  };

  if (loading) return <p className="text-center text-muted">Yükleniyor...</p>;

  if (!matchToRate) return null;
  
  if (!matchToRate.rateeId) {
    return (
      <div className="container my-4 p-4 border rounded shadow-sm bg-light">
        <h4 className="mb-3 text-success">Puanlanacak Kullanıcıyı Seç</h4>
  
        <div className="mb-3">
          <label htmlFor="rateeSelect" className="form-label">Kullanıcı:</label>
          <select
            id="rateeSelect"
            className="form-select"
            value={selectedRatee}
            onChange={e => setSelectedRatee(e.target.value)}
          >
            <option value="">-- Seçin --</option>
            {rateCandidates.map(p => (
              <option key={p._id} value={p._id}>
                {p.fullName}
              </option>
            ))}
          </select>
        </div>
  
        <div className="d-flex justify-content-end">
          <button className="btn btn-success" onClick={handleSelect}>
            Devam Et
          </button>
        </div>
      </div>
    );
  }  

  return (
    <RatePlayerModal
      matchId={matchToRate.matchId}
      rateeId={matchToRate.rateeId}
      raterId={matchToRate.raterId}
      onClose={handleModalClose}
    />
  );
};

export default RatingPage;