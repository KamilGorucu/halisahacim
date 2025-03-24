import React, { useState } from 'react';
import axios from 'axios';
import '../css/CreateRequest.css';
const API_URL = process.env.REACT_APP_API_URL;
const CreateRequest = () => {
  const [type, setType] = useState('findOpponent');
  const [teamSize, setTeamSize] = useState('');
  const [position, setPosition] = useState(''); // Takım arayanın mevkisi
  const [positionNeeded, setPositionNeeded] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(''); // Şehir bilgisi

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      type,
      location: { city }, // Şehir bilgisi frontend'den gönderilir
      teamSize: type === 'findOpponent' ? teamSize : undefined,
      position: type === 'findTeam' ? position : undefined,
      positionNeeded: type === 'findPlayer' ? positionNeeded : undefined,
      description,
    };

    try {
      await axios.post(`${API_URL}/requests`, requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Talep başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Talep oluşturulamadı:', error);
    }
  };

  return (
    <div className="request-container">
      <h2 className="request-title">📌 Yeni Talep Oluştur</h2>
      <form className="request-form" onSubmit={handleSubmit}>
        {/* Talep Türü */}
        <label className="request-label">
          Talep Türü:
          <select className="request-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="findOpponent">Rakip Bul</option>
            <option value="findPlayer">Oyuncu Bul</option>
            <option value="findTeam">Takım Bul</option>
          </select>
        </label>

        {/* Takım Boyutu */}
        {type === 'findOpponent' && (
          <label className="request-label">
            Takım Boyutu:
            <input
              className="request-input"
              type="text"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="Örneğin: 5v5, 7v7"
            />
          </label>
        )}

        {/* İstenen Mevki */}
        {type === 'findPlayer' && (
          <label className="request-label">
            İstenen Mevki:
            <input
              className="request-input"
              type="text"
              value={positionNeeded}
              onChange={(e) => setPositionNeeded(e.target.value)}
              placeholder="Örneğin: Kaleci, Forvet"
            />
          </label>
        )}

        {/* Takım Bul - Mevki */}
        {type === 'findTeam' && (
          <label className="request-label">
            Mevki:
            <input
              className="request-input"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Örneğin: Orta Saha"
            />
          </label>
        )}

        {/* Açıklama */}
        <label className="request-label">
          Açıklama:
          <textarea
            className="request-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ek açıklamalarınızı yazın..."
          ></textarea>
        </label>

        {/* Şehir */}
        <label className="request-label">
          Şehir:
          <input
            className="request-input"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Baş harfi büyük Örn:(Antalya)"
            required
          />
        </label>

        <button className="request-button" type="submit">📩 Talep Oluştur</button>
      </form>
    </div>
  );
};

export default CreateRequest;
