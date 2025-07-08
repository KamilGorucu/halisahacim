import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import FifaCard from './FifaCard';
import '../css/LineupManager.css';
import sahaImage from '../image/saha2.png';

const LineupManager = () => {
  const { user } = useContext(AuthContext);
  const [lineups, setLineups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchLineups();
    }
  }, [user]);

  useEffect(() => {
    const field = document.querySelector('.lineup-field-wrapper');
    const updateScale = () => {
      if (!field) return;
      const scale = Math.min(field.offsetWidth / 1240, 1);
      document.documentElement.style.setProperty('--scale', scale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const fetchLineups = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/lineups/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLineups(res.data);
    } catch (err) {
      console.error("Kadro alınamadı:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kadroyu silmek istediğine emin misin?')) return;
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/lineups/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchLineups();
  };

  return (
    <div className="lineup-manager-container">
      <div className="lineup-manager-header">
        <h2>📋 Kadrolarım</h2>
        <button className="create-lineup-btn" onClick={() => navigate('/lineups/create')}>
          ➕ Yeni Kadro Oluştur
        </button>
      </div>

      {lineups.length === 0 ? (
        <p>Henüz oluşturulmuş kadronuz yok.</p>
      ) : (
        <div className="lineup-list">
          {lineups.map((lineup) => (
            <div key={lineup._id} className="lineup-card-wrapper">
              <div className="lineup-card">
              <h3 className="lineup-name">{lineup.name}</h3>
                <div className="lineup-field-wrapper">
                  <img src={sahaImage} alt="Saha" className="lineup-field-bg" />
                  {lineup.players.map((p, index) => {
                    const imageUrl = p.player.photo
                      ? `${process.env.REACT_APP_API_URL}/${p.player.photo.replace(/^\/+/, '')}`
                      : undefined;
                    return (
                      <div
                        key={index}
                        style={{
                          left: `${p.x}%`,
                          top: `${p.y + 9}%`,
                          position: 'absolute',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <FifaCard
                          user={{
                            ...p.player,
                            imageUrl,
                            position: p.position,
                            fifaStats: p.player.fifaStats,
                            foot: p.player.foot,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <button className="delete-button" onClick={() => handleDelete(lineup._id)}>🗑️ Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineupManager;
