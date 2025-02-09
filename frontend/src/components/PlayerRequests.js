import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from './ChatBox';
import CitySelector from './CitySelector';

const PlayerRequests = () => {
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

  return (
    <div>
      <h2>Oyuncu Bulma Talepleri</h2>
      <CitySelector selectedCity={selectedCity} setSelectedCity={setSelectedCity} />
      <ul>
        {selectedCity && requests.length > 0 ? (
          requests.map((req) => (
            <li key={req._id}>
              <strong>Mevki:</strong> {req.positionNeeded || 'Belirtilmemiş'} <br />
              <strong>Açıklama:</strong> {req.description || 'Belirtilmemiş'} <br />
              <strong>Kullanıcı:</strong> {req.user.fullName} <br />
              <button onClick={() => setActiveChat({ id: req.user._id, model: 'User' })}>
                Mesajlaş
              </button>
            </li>
          ))
        ) : selectedCity ? (
          <p>Bu şehirde henüz oyuncu bulma talebi yok.</p>
        ) : (
          <p>Lütfen bir şehir seçin.</p>
        )}
      </ul>

      {/* ChatBox Bileşeni */}
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
