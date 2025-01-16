import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AvailableSlotsTable = () => {
  const [slots, setSlots] = useState([]); // Boş ve dolu saatlerin listesi
  const location = useLocation();
  const business = location.state?.business || {}; // İşletme bilgileri
  const [selectedDate, setSelectedDate] = useState(''); // Seçilen tarih

  // API'den saat aralıklarını çekme
  const fetchSlots = async () => {
    if (!selectedDate) return; // Tarih seçilmemişse işlem yapma

    try {
      const response = await fetch(
        `http://localhost:5002/api/reservations/available-slots?businessId=${business._id}&date=${selectedDate}`
      );

      const data = await response.json();
      if (response.ok) {
        setSlots(data.slots); // Gelen saat aralıklarını kaydet
      } else {
        alert(data.message || 'Saat aralıkları alınamadı.');
      }
    } catch (error) {
      console.error('Saat aralıkları alınamadı:', error);
    }
  };

  // Rezervasyon yapma işlemi
  const handleReservation = async (timeSlot) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ businessId: business._id, date: selectedDate, timeSlot }),
      });

      if (response.ok) {
        alert('Rezervasyon başarıyla oluşturuldu!');
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
  }, [selectedDate]);

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
      <h3>Saat Aralıkları</h3>
      {slots.length > 0 ? (
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
                    <button onClick={() => handleReservation(slot.timeSlot)}>Rezervasyon Yap</button>
                  ) : (
                    <span>Rezervasyon Yapılamaz</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Seçilen tarih için saat aralığı bulunamadı.</p>
      )}
    </div>
  );
};

export default AvailableSlotsTable;
