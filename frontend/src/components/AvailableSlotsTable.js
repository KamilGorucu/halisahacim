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
        `http://localhost:5002/api/reservations/available-slots?businessId=${business._id}&date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();
      console.log('API Response:', data); // Gelen veriyi kontrol etmek için log ekledik
      if (response.ok) {
        setSlots(data.slots); // Gelen saat aralıklarını kaydet
      } else {
        alert(data.message || 'Saat aralıkları alınamadı.');
      }
    } catch (error) {
      console.error('Saat aralıkları alınamadı:', error);
    }
  }, [selectedDate, business._id]);

  // Rezervasyon yapma işlemi
  const handleReservation = async (fieldName, timeSlot) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userEmail: localStorage.getItem('email'),
          businessId: business._id,
          date: selectedDate,
          timeSlot,
          fieldName,
        }),
      });
      console.log({
        userEmail: localStorage.getItem('email'),
        businessId: business._id,
        date: selectedDate,
        timeSlot,
        fieldName,
      });

      if (response.ok) {
        alert('Rezervasyon isteği başarıyla gönderildi! Mesaj kutunuzu kontrol ediniz!');
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
      {slots.length > 0 ? (
        slots.map((field, index) => (
          <div key={index}>
            <h4>{field.fieldName} ({field.capacity})</h4>
            <table border="1" style={{ width: '100%', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th>Saat Aralığı</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {field.timeSlots.map((slot, i) => (
                  <tr key={i}>
                    <td>{slot.timeSlot}</td>
                    <td>{slot.isAvailable ? 'Boş' : 'Dolu'}</td>
                    <td>
                      {slot.status === 'pending' && slot.userEmail === localStorage.getItem('email') ? (
                        <span>Bekliyor</span>
                      ) : slot.isAvailable ? (
                        <button onClick={() => handleReservation(field.fieldName, slot.timeSlot)}>
                          Rezervasyon Yap
                        </button>
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
        <p>Tarih Seçiniz.</p>
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
