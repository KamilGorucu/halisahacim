import React, { useState, useEffect } from 'react';

const BusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    location: { city: '', coordinates: [] },
    workingHours: [],
    equipment: '',
    price: '',
  });
  const [reservations, setReservations] = useState([]); // Rezervasyonları tutar.

  // Profil bilgilerini al.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/profile/business', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('Profil alınamadı:', error);
      }
    };

    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/reservations/business', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error('Rezervasyonlar alınamadı:', error);
      }
    };

    fetchProfile();
    fetchReservations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/profile/business/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Profil başarıyla güncellendi!');
      } else {
        alert('Profil güncellenemedi.');
      }
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>İşletme Profilimi Güncelle</h2>
        <input
          type="text"
          placeholder="İşletme Adı"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          required
        />
        <textarea
          placeholder="Ekipman Bilgileri"
          value={formData.equipment}
          onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
        />
        <input
          type="number"
          placeholder="Fiyat"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
        <button type="submit">Güncelle</button>
      </form>

      <div>
        <h2>Rezervasyon İstekleri</h2>
        {reservations.length === 0 ? (
          <p>Henüz rezervasyon isteği yok.</p>
        ) : (
          <ul>
            {reservations.map((res) => (
              <li key={res._id}>
                <p>
                  <strong>Kullanıcı:</strong> {res.user.fullName} ({res.user.email})
                </p>
                <p>
                  <strong>Tarih:</strong> {res.date}
                </p>
                <p>
                  <strong>Saat:</strong> {res.timeSlot}
                </p>
                <p>
                  <strong>Durum:</strong> {res.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;