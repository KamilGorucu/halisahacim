import React, { useState, useEffect } from 'react';

const BusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    location: { city: '', coordinates: [] },
    workingHours: [],
    equipment: '',
    price: '',
    fieldCount: 0, // Yeni eklenen saha sayısı
  });
  const [reservations, setReservations] = useState([]); // Rezervasyonları tutar.

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/profile/business', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Profil alınamadı.');
        const data = await response.json();
        setFormData({
          businessName: data.businessName || '',
          location: data.location || { city: '', coordinates: [] },
          workingHours: data.workingHours || [],
          equipment: data.equipment || '',
          price: data.price || '',
          fieldCount: data.fieldCount || 0,
        });
      } catch (error) {
        console.error('Profil alınamadı:', error);
      }
    };

    const fetchReservations = async () => {
      try {
        const response = await fetch(`http://localhost:5002/api/reservations/business-reservations?businessId=${localStorage.getItem('businessId')}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (response.ok) {
          setReservations(data.reservations);
        } else {
          console.error('Rezervasyonlar alınamadı:', data.message);
        }
      } catch (error) {
        console.error('Rezervasyonlar alınamadı:', error);
      }
    };

    fetchProfile();
    fetchReservations();
  }, []);

  const handleApprove = async (reservationId) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reservationId }),
      });
      if (response.ok) {
        alert('Rezervasyon onaylandı!');
        setReservations((prev) =>
          prev.map((res) =>
            res._id === reservationId ? { ...res, status: 'approved' } : res
          )
        );
      } else {
        console.error('Rezervasyon onaylanamadı.');
      }
    } catch (error) {
      console.error('Rezervasyon onaylanamadı:', error);
    }
  };

  const handleReject = async (reservationId) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reservationId }),
      });
      if (response.ok) {
        alert('Rezervasyon reddedildi!');
        setReservations((prev) =>
          prev.map((res) =>
            res._id === reservationId ? { ...res, status: 'rejected' } : res
          )
        );
      } else {
        console.error('Rezervasyon reddedilemedi.');
      }
    } catch (error) {
      console.error('Rezervasyon reddedilemedi:', error);
    }
  };

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
        console.error('Profil güncellenemedi.');
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
          placeholder="Saha Sayısı"
          value={formData.fieldCount}
          onChange={(e) => setFormData({ ...formData, fieldCount: e.target.value })}
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
                {res.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(res._id)}>Onayla</button>
                    <button onClick={() => handleReject(res._id)}>Reddet</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;
