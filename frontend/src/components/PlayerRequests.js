import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ChatBox from './ChatBox';
import CitySelector from './CitySelector';
import AuthContext from '../contexts/AuthContext';
import '../css/PlayerRequests.css';

const PlayerRequests = () => {
  const { user } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('http://localhost:5002/api/requests', {
          params: { type: 'findPlayer', city: selectedCity },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Oyuncu bulma talepleri alınamadı:', error);
      }
    };

    fetchRequests();
  }, [selectedCity]);

  const handleMatch = async (reqId, matchedUser) => {
    try {
      await axios.put(`http://localhost:5002/api/requests/${reqId}/status`, { matchedUser }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
  
      alert('Oyuncu bulundu olarak işaretlendi.');
      setRequests((prevRequests) => prevRequests.filter((req) => req._id !== reqId));
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };
  
  return (
    <div className="player-container">
    <h2 className="player-title">⚽ Oyuncu Arayanlar</h2>
    <CitySelector selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

    <ul className="player-list">
      {selectedCity && requests.length > 0 ? (
        requests.map((req) => (
          <li key={req._id} className="player-item">
            <p className="player-info"><strong>🏅 Mevki:</strong> {req.positionNeeded || 'Belirtilmemiş'}</p>
            <p className="player-info"><strong>📝 Açıklama:</strong> {req.description || 'Belirtilmemiş'}</p>
            <p className="player-info">
              <strong>👤 Kullanıcı:</strong> 
              <Link to={`/user/${req.user._id}`} className="player-user-link">
                {req.user.fullName}
              </Link>
            </p>
            <div className="player-buttons">
              <button className="player-button message-btn" onClick={() => setActiveChat({ id: req.user._id, model: 'User' })}>
                💬 Mesajlaş
              </button>
              {req.user._id === user?.id && (
                <button className="player-button found-btn" onClick={() => handleMatch(req._id, req.user._id)}>
                ✅ Oyuncu Bulundu
              </button>
              )}
            </div>
          </li>
        ))
      ) : selectedCity ? (
        <p className="player-empty">Bu şehirde henüz oyuncu bulma talebi yok.</p>
      ) : (
        <p className="player-empty">Lütfen bir şehir seçin.</p>
      )}
    </ul>

    {activeChat && (
      <ChatBox
        receiverId={activeChat.id}
        receiverModel={activeChat.model}
        onClose={() => setActiveChat(null)}
      />
    )}
  </div>
  );
};

export default PlayerRequests;
