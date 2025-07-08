import React, { useState, useEffect } from 'react';
import FifaCard from './FifaCard';
import '../css/UserProfile.css';

const API_URL = process.env.REACT_APP_API_URL;

const allowedPositions = [
  'Kaleci',
  'Stoper',
  'Bek',
  'Orta Saha',
  'Ofansif Orta Saha',
  'Kanat',
  'Forvet',
];

const UserProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    teams: '',
    position: '',
    speed: 60,
    shooting: 60,
    passing: 60,
    dribbling: 60,
    defense: 60,
    physical: 60,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile/user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) {
          alert('Profil bilgileri alınamadı.');
          return;
        }
        const data = await response.json();
        setFormData({
          ...data,
          ...(data.fifaStats || {}) // <- fifaStats içini dışarı çıkar
        });
      } catch (error) {
        console.error('Profil alınamadı:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/profile/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          fifaStats: {
            speed: formData.speed,
            shooting: formData.shooting,
            passing: formData.passing,
            dribbling: formData.dribbling,
            defense: formData.defense,
            physical: formData.physical,
          }
        }),
      });

      if (!response.ok) {
        alert('Profil güncellenemedi.');
        return;
      }
      alert('Profil başarıyla güncellendi!');
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Profilimi Güncelle</h2>

      <div className="d-flex justify-content-center mb-4">
        <FifaCard user={{ ...formData, imageUrl: `${API_URL}/${formData.photo}` }} />
      </div>

      <form className="row g-3 mx-auto" onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className="col-12">
          <input
            type="text"
            className="form-control"
            placeholder="Ad Soyad"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>
        <div className="col-12">
          <input
            type="email"
            className="form-control"
            placeholder="E-posta"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="col-12">
          <input
            type="text"
            className="form-control"
            placeholder="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="col-12">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Oynadığınız Takımlar"
            value={formData.teams}
            onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
          />
        </div>
        <div className="col-12">
          <select
            className="form-select"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            required
          >
            <option value="">Pozisyon Seçin</option>
            {allowedPositions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        <div className="col-12 text-center">
          <button type="submit" className="btn btn-success rounded-pill px-4">Güncelle</button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
