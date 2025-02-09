import React, { useState } from 'react';
import axios from 'axios';

const CreateRequest = () => {
  const [type, setType] = useState('findOpponent');
  const [teamSize, setTeamSize] = useState('');
  const [positionNeeded, setPositionNeeded] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(''); // Şehir bilgisi

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      type,
      location: { city }, // Şehir bilgisi frontend'den gönderilir
      teamSize: type === 'findOpponent' ? teamSize : undefined,
      positionNeeded: type === 'findPlayer' ? positionNeeded : undefined,
      description,
    };

    try {
      const response = await axios.post('http://localhost:5002/api/requests', requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Talep başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Talep oluşturulamadı:', error);
    }
  };

  return (
    <div>
      <h2>Yeni Talep Oluştur</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Talep Türü:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="findOpponent">Rakip Bul</option>
            <option value="findPlayer">Oyuncu Bul</option>
          </select>
        </label>

        {type === 'findOpponent' && (
          <label>
            Takım Boyutu:
            <input
              type="text"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="Örneğin: 5v5, 7v7"
            />
          </label>
        )}

        {type === 'findPlayer' && (
          <label>
            İstenen Mevki:
            <input
              type="text"
              value={positionNeeded}
              onChange={(e) => setPositionNeeded(e.target.value)}
              placeholder="Örneğin: Kaleci, Forvet"
            />
          </label>
        )}

        <label>
          Açıklama:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ek açıklamalarınızı yazın..."
          ></textarea>
        </label>

        <label>
          Şehir:
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Baş harfi büyük Örn:(Antalya)"
            required
          />
        </label>

        <button type="submit">Talep Oluştur</button>
      </form>
    </div>
  );
};

export default CreateRequest;
