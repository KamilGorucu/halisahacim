import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import CitySelector from './CitySelector';
import ChatBox from './ChatBox';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../css/TeamRequests.css';
const API_URL = process.env.REACT_APP_API_URL;
const TeamRequests = () => {
  const { user } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get(`${API_URL}/requests`, {
          params: { type: 'findTeam', city: selectedCity },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Takım bulma talepleri alınamadı:', error);
      }
    };

    fetchRequests();
  }, [selectedCity]);

  const handleMatch = async (reqId, matchedUser) => {
    try {
      await axios.put(`${API_URL}/requests/${reqId}/status`, { matchedUser }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
  
      alert('Takım bulundu olarak işaretlendi.');
      setRequests((prevRequests) => prevRequests.filter((req) => req._id !== reqId));
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };
  

  return (
    <div className="team-container">
      <h2 className="team-title">🏆 Takım Arayanlar</h2>
      <CitySelector selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

      <ul className="team-list">
        {selectedCity && requests.length > 0 ? (
          requests.map((req) => (
            <li key={req._id} className="team-item">
              <p className="team-info"><strong>🎯 Mevki:</strong> {req.position || 'Belirtilmemiş'}</p>
              <p className="team-info"><strong>📝 Açıklama:</strong> {req.description || 'Belirtilmemiş'}</p>
              <p className="team-info">
                <strong>👤 Kullanıcı:</strong> 
                <Link to={`/user/${req.user._id}`} className="team-user-link">
                  {req.user.fullName}
                </Link>
              </p>
              <div className="team-buttons">
                <button 
                  className="common-button message-btn"
                  onClick={() => setActiveChat({ id: req.user._id, model: 'User' })}
                >
                  💬 Mesajlaş
                </button>
                {req.user._id === user?.id && ( // Yalnızca ilan sahibi için görünür
                  <button className="common-button found-btn" onClick={() => handleMatch(req._id, req.user._id)}>
                  ✅ Takım Bulundu
                </button>
                )}
              </div>
            </li>
          ))
        ) : selectedCity ? (
          <p className="team-empty">Bu şehirde henüz takım arayan yok.</p>
        ) : (
          <p className="team-empty">Lütfen bir şehir seçin.</p>
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

export default TeamRequests;
