import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const AvailableSlotsTable = () => {
  const [slots, setSlots] = useState([]); // Boş ve dolu saatlerin listesi
  const location = useLocation();
  const business = location.state?.business || {}; // İşletme bilgileri
  const [selectedDate, setSelectedDate] = useState(''); // Seçilen tarih

  // API'den saat aralıklarını çekme
  const fetchSlots = useCallback(async () => {
    if (!selectedDate) return; // Tarih seçilmemişse işlem yapma

    try {
      const response = await fetch(
        `http://localhost:5002/api/reservations/available-slots?businessId=${business._id}&date=${selectedDate}`
      );

      const data = await response.json();
      if (response.ok) {
        setSlots(data.availability); // Gelen saat aralıklarını kaydet
      } else {
        alert(data.message || 'Saat aralıkları alınamadı.');
      }
    } catch (error) {
      console.error('Saat aralıkları alınamadı:', error);
    }
  },[selectedDate, business._id]);

  // Rezervasyon yapma işlemi
  const handleReservation = async (timeSlot) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userEmail: localStorage.getItem('email'), // Kullanıcı ID'sini ekleyin
          businessId: business._id,
          date: selectedDate,
          timeSlot,
        }),
      });
      console.log({
        userEmail: localStorage.getItem('email'),
        businessId: business._id,
        date: selectedDate,
        timeSlot,
      });

      if (response.ok) {
        alert('Rezervasyon isteği başarıyla gönderildi! Mail adresinizi kontrol ediniz!');
        fetchSlots(); // Rezervasyondan sonra saat aralıklarını yenile
      } else {
        const data = await response.json();
        alert(data.message || 'Rezervasyon sırasında bir hata oluştu.');
      }
    } catch (error) {
      console.error('Rezervasyon yapılamadı:', error);
    }
  };

  // Tarih seçildiğinde saat aralıklarını getir
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return (
    <div>
      <h2>{business.businessName}</h2>
      <label>
        Tarih Seç:
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />
      </label>
      <h3>Sahalar</h3>
      {business.fields && business.fields.length > 0 ? (
        business.fields.map((field, index) => (
          <div key={index}>
            <h4>{field.name} ({field.capacity})</h4>
            <table border="1" style={{ width: '100%', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th>Saat Aralığı</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.timeSlot}>
                    <td>{slot.timeSlot}</td>
                    <td>{slot.isAvailable ? 'Boş' : 'Dolu'}</td>
                    <td>
                      {slot.isAvailable ? (
                        <button>Rezervasyon Yap</button>
                      ) : (
                        <span>Dolu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>Saha bilgisi bulunamadı.</p>
      )}
      {/* İşletme Fotoğrafları */}
      <div>
        <h3>İşletme Fotoğrafları</h3>
        {business.photos && business.photos.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {business.photos.map((photo, index) => (
              <img
                key={index}
                src={`http://localhost:5002/${photo}`}
                alt={`${business.businessName} Fotoğrafı`}
                style={{ width: '150px', height: '100px', objectFit: 'cover' }}
              />
            ))}
          </div>
        ) : (
          <p>Bu işletme için fotoğraf bulunmamaktadır.</p>
        )}
      </div>
    </div>
  );
};

export default AvailableSlotsTable;
