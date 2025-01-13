import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    teams: '',
    position: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/profile/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) {
          alert('Profil bilgileri alınamadı.');
          return;
        }
        const data = await response.json();
        setFormData(data); // Gelen bilgileri state'e ata
      } catch (error) {
        console.error('Profil alınamadı:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/profile/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
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
    <div>
      <h2>Profilimi Güncelle</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ad Soyad"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Telefon"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <textarea
          placeholder="Oynadığınız Takımlar"
          value={formData.teams}
          onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
        />
        <input
          type="text"
          placeholder="Pozisyon (ör. Forvet, Kaleci)"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
        <button type="submit">Güncelle</button>
      </form>
    </div>
  );
};

export default UserProfile;
