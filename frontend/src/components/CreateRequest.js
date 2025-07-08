import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import CitySelector from './CitySelector';
import '../css/CreateRequest.css';

const API_URL = process.env.REACT_APP_API_URL;

const CreateRequest = () => {
  const { user } = useContext(AuthContext);
  const [type, setType] = useState('findOpponent');
  const [teamSize, setTeamSize] = useState('');
  const [lineups, setLineups] = useState([]);
  const [selectedLineup, setSelectedLineup] = useState('');
  const [position, setPosition] = useState(''); // Takım arayanın mevkisi
  const [positionNeeded, setPositionNeeded] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(''); // Şehir bilgisi

  useEffect(() => {
    if (type === 'findOpponent') {
      fetchLineups();
    }
  }, [type]);

  const fetchLineups = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lineups/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLineups(res.data);
    } catch (err) {
      console.error('Kadro listesi alınamadı:', err);
    }
  };

  const handleLineupChange = (id) => {
    const lineup = lineups.find(l => l._id === id);
    setSelectedLineup(id);
    setTeamSize(lineup?.players?.length || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (type === 'findOpponent' && (!selectedLineup || !teamSize)) {
      alert('Lütfen geçerli bir kadro seçin.');
      return;
    }

    const requestData = {
      type,
      location: { city: city || '' },
      teamSize: type === 'findOpponent' ? teamSize : undefined,
      lineupId: type === 'findOpponent' ? selectedLineup : undefined,
      position: type === 'findTeam' ? position : undefined,
      positionNeeded: type === 'findPlayer' ? positionNeeded : undefined,
      description,
    };

    try {
      await axios.post(`${API_URL}/api/requests`, requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Talep başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Talep oluşturulamadı:', error);
      
      if (error.response?.status === 429) {
        alert('❗ Haftalık maksimum talep sınırına ulaştınız. Yeni ilan oluşturmak için eski ilanlarınızın süresi dolmalı.');
      } else if (error.response?.data?.message) {
        alert(`Hata: ${error.response.data.message}`);
      } else {
        alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  return (
    <div className="container my-4">
      <h4 className="text-success fw-bold mb-3">
        <i className="bi bi-clipboard-plus me-2"></i>Yeni Talep Oluştur
      </h4>

      <div className="alert alert-info small" role="alert">
        <p className="mb-1"><i className="bi bi-exclamation-circle-fill me-2"></i><strong>Bilgilendirme:</strong> Her kullanıcı haftada en fazla <strong>5 talep</strong> oluşturabilir.</p>
        <p className="mb-1"><strong>Kaleciler</strong> "Takım Bul" ilanı için <strong>14</strong> talep oluşturabilir.</p>
        <p className="mb-1"><i className="bi bi-check-circle-fill me-2"></i>Aktif ilanınız varken yenisini oluşturamazsınız.</p>
        <p className="mb-0"><i className="bi bi-hourglass-split me-2"></i>İlanınız 7 gün içinde tamamlanmazsa otomatik silinir.</p>
      </div>

      <form className="row g-3" onSubmit={handleSubmit}>
        {/* Talep Türü */}
        <div className="col-md-6">
          <label className="form-label fw-semibold">Talep Türü:</label>
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="findOpponent">Rakip Bul</option>
            <option value="findPlayer">Oyuncu Bul</option>
            <option value="findTeam">Takım Bul</option>
          </select>
        </div>

        {/* Kadro ve Takım Boyutu */}
        {type === 'findOpponent' && (
          <>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Kadro Seçin:</label>
              <select
                className="form-select"
                value={selectedLineup}
                onChange={(e) => handleLineupChange(e.target.value)}
                required
              >
                <option value="">Kadronuzu seçin</option>
                {lineups.map((lineup) => (
                  <option key={lineup._id} value={lineup._id}>
                    {lineup.name || `Kadro (${lineup.players.length} kişi)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Takım Boyutu:</label>
              <input type="number" className="form-control" value={teamSize} disabled />
            </div>
          </>
        )}

        {/* İstenen Mevki */}
        {type === 'findPlayer' && (
          <div className="col-md-6">
            <label className="form-label fw-semibold">İstenen Mevki:</label>
            <select
              className="form-select"
              value={positionNeeded}
              onChange={(e) => setPositionNeeded(e.target.value)}
              required
            >
              <option value="">Pozisyon Seçin</option>
              <option value="Kaleci">Kaleci</option>
              <option value="Stoper">Stoper</option>
              <option value="Bek">Bek</option>
              <option value="Orta Saha">Orta Saha</option>
              <option value="Ofansif Orta Saha">Ofansif Orta Saha</option>
              <option value="Kanat">Kanat</option>
              <option value="Forvet">Forvet</option>
            </select>
          </div>
        )}

        {/* Takım Bul - Mevki */}
        {type === 'findTeam' && (
          <div className="col-md-6">
            <label className="form-label fw-semibold">Mevki:</label>
            <select
              className="form-select"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            >
              <option value="">Pozisyon Seçin</option>
              <option value="Kaleci">Kaleci</option>
              <option value="Stoper">Stoper</option>
              <option value="Bek">Bek</option>
              <option value="Orta Saha">Orta Saha</option>
              <option value="Ofansif Orta Saha">Ofansif Orta Saha</option>
              <option value="Kanat">Kanat</option>
              <option value="Forvet">Forvet</option>
            </select>
          </div>
        )}

        {/* Açıklama */}
        <div className="col-12">
          <label className="form-label fw-semibold">Açıklama:</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ek açıklamalarınızı yazın..."
            rows="3"
          ></textarea>
        </div>

        {/* Şehir Seçici */}
        <div className="col-md-6">
          <CitySelector selectedCity={city} setSelectedCity={setCity} />
        </div>

        {/* Gönder Butonu */}
        <div className="col-12 mt-3">
          <button className="btn btn-success w-100" type="submit">
            <i className="bi bi-send-fill me-2"></i>Talep Oluştur
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;
