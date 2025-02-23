import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CitySelector from './CitySelector';
import { Link } from 'react-router-dom';
import '../css/TeamRequests.css';

const TeamRequests = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('http://localhost:5002/api/requests', {
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
            </li>
          ))
        ) : selectedCity ? (
          <p className="team-empty">Bu şehirde henüz takım arayan yok.</p>
        ) : (
          <p className="team-empty">Lütfen bir şehir seçin.</p>
        )}
      </ul>
    </div>
  );
};

export default TeamRequests;
