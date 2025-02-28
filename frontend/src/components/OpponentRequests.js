import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ChatBox from './ChatBox';
import CitySelector from './CitySelector';
import AuthContext from '../contexts/AuthContext';
import '../css/OpponentRequests.css';

const OpponentRequests = () => {
  const { user } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('http://localhost:5002/api/requests', {
          params: { type: 'findOpponent', city: selectedCity },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Rakip bulma talepleri alınamadı:', error);
      }
    };

    fetchRequests();
  }, [selectedCity]);

  return (
    <div className="opponent-container">
      <h2 className="opponent-title">🏆 Rakip Arayanlar</h2>
      <CitySelector selectedCity={selectedCity} setSelectedCity={setSelectedCity} />
      
      <ul className="opponent-list">
        {selectedCity && requests.length > 0 ? (
          requests.map((req) => (
            <li key={req._id} className="opponent-item">
              <p className="opponent-info"><strong>⚽ Takım Boyutu:</strong> {req.teamSize}</p>
              <p className="opponent-info"><strong>📝 Açıklama:</strong> {req.description || 'Belirtilmemiş'}</p>
              <p className="opponent-info">
                <strong>👤 Kullanıcı:</strong> 
                <Link to={`/user/${req.user._id}`} className="opponent-user-link">
                  {req.user.fullName}
                </Link>
              </p>
              <div className="opponent-buttons">
                <button className="opponent-button message-btn" onClick={() => setActiveChat({ id: req.user._id, model: 'User' })}>
                  💬 Mesajlaş
                </button>
                {req.user._id === user?.id && (
                  <button className="opponent-button found-btn" onClick={async () => {
                      try {
                        await axios.put(`http://localhost:5002/api/requests/${req._id}/status`, {}, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        });
                        alert('Rakip bulundu olarak işaretlendi.');
                      } catch (error) {
                        console.error('Durum güncellenemedi:', error);
                      }
                    }}>
                    ✅ Rakip Bulundu
                  </button>
                )}
              </div>
            </li>
          ))
        ) : selectedCity ? (
          <p className="opponent-empty">Bu şehirde henüz rakip bulma talebi yok.</p>
        ) : (
          <p className="opponent-empty">Lütfen bir şehir seçin.</p>
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

export default OpponentRequests;
