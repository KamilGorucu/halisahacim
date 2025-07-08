import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import FifaCard from './FifaCard';
import '../css/RatePlayerModal.css';

const API_URL = process.env.REACT_APP_API_URL;

const statList = ["speed", "shooting", "passing", "dribbling", "defense", "physical"];

const RatePlayerModal = ({ matchId, rateeId, raterId, onClose }) => {
const { user } = useContext(AuthContext);
const [playerData, setPlayerData] = useState(null);
const [ratings, setRatings] = useState({
    speed: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defense: 50,
    physical: 50,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${rateeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPlayerData(res.data);
      } catch (err) {
        console.error("Oyuncu bilgisi alınamadı:", err);
      }
    };
    fetchPlayer();
  }, [rateeId]);

  const handleChange = (stat, value) => {
    setRatings((prev) => ({ ...prev, [stat]: Number(value) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/api/matches/${matchId}/rate`, {
        raterId,
        rateeId,
        ratings,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccessMsg("Puanlama başarılı!");
      setTimeout(() => {
        onClose({ refresh: true });
      }, 1000);
    } catch (err) {
      console.error("Puanlama hatası:", err);
      alert("Puanlama başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">{playerData?.fullName} için Puanlama</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => onClose({ refresh: true })}></button>
          </div>

          <div className="modal-body">
            {playerData && (
              <>
                <div className="text-center mb-4">
                  <FifaCard user={playerData} />
                </div>

                {statList.map((stat) => (
                  <div className="mb-3" key={stat}>
                    <label htmlFor={stat} className="form-label fw-bold">
                      {stat.toUpperCase()} <span className="text-muted ms-2">{ratings[stat]}</span>
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      id={stat}
                      min="0"
                      max="100"
                      value={ratings[stat]}
                      onChange={(e) => handleChange(stat, e.target.value)}
                    />
                  </div>
                ))}

                {successMsg && (
                  <div className="alert alert-success text-center">
                    {successMsg}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={() => onClose({ refresh: true })}
            >
              Kapat
            </button>
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Gönderiliyor...' : 'Puanla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatePlayerModal;
