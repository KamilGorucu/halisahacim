// frontend tarafında BusinessProfile.js ve BusinessReservationTable.js dosyalarını inceleyerek businessId'nin doğru alındığından emin olun.
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
  const [weeklySlots, setWeeklySlots] = useState([]); // Haftalık görünüm için saat aralıkları

  useEffect(() => {
    // console.log('Business ID from localStorage:', localStorage.getItem('businessId')); // Log ekle
  if (!localStorage.getItem('businessId')) {
    console.error('Business ID bulunamadı. Lütfen giriş yaptığınızdan emin olun.');
  }
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/profile/business', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Profil alınamadı.');
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

    const fetchWeeklySlots = async () => {
      const businessId = localStorage.getItem('businessId');
      if (!businessId) {
        console.error('Business ID bulunamadığı için haftalık saatler getirilemiyor.');
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:5002/api/reservations/weekly?businessId=${localStorage.getItem(
            'businessId'
          )}&startDate=${getStartOfWeek()}&endDate=${getEndOfWeek()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await response.json();
        // console.log('Backend Weekly Data:', data); // Gelen veriyi logla
        if (response.ok) {
          setWeeklySlots(data.weeklyData);
        } else {
          console.error('Haftalık saatler alınamadı:', data.message);
        }
      } catch (error) {
        console.error('Haftalık saatler alınamadı:', error);
      }
    };

    fetchProfile();
    fetchReservations();
    fetchWeeklySlots();
  }, []);

  const getStartOfWeek = () => {
    const now = new Date();
    const first = now.getDate() - now.getDay() + 1;
    return new Date(now.setDate(first)).toISOString().split('T')[0];
  };

  const getEndOfWeek = () => {
    const now = new Date();
    const last = now.getDate() - now.getDay() + 7;
    return new Date(now.setDate(last)).toISOString().split('T')[0];
  };

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

      {/* Haftalık Saat Görünümü */}
      <h2>Haftalık Rezervasyon Tablonuz</h2>
      <table>
        <thead>
          <tr>
            <th>Saat</th>
            {weeklySlots.length > 0 &&
              weeklySlots[0].daySlots.map((slot, index) => (
                <th key={index}>{slot.timeSlot}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {weeklySlots.map((day, index) => (
            <tr key={index}>
              <td>{new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
              {day.daySlots.map((slot, slotIndex) => (
                <td
                  key={slotIndex}
                  style={{ backgroundColor: slot.isAvailable ? 'lightgreen' : 'lightcoral' }}
                >
                  {slot.isAvailable ? 'Boş' : `Dolu (${slot.user?.fullName || 'Bilinmiyor'})`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>


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
