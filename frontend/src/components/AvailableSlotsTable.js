import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/AvailableSlotsTable.css';

const AvailableSlotsTable = () => {
  const [slots, setSlots] = useState([]); // Boş ve dolu saatlerin listesi
  const location = useLocation();
  const business = location.state?.business || {}; // İşletme bilgileri
  const [selectedDate, setSelectedDate] = useState(''); // Seçilen tarih
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
        setSlots([...data.slots]); // ✅ State değişikliğini zorlamak için yeni array oluşturduk.
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
    <div className="available-slots-container">
      <h2 className="business-name">{business.businessName}</h2>
      
      <label className="date-label">
        Tarih Seç:
        <input
          type="date"
          className="date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />
      </label>
      
      <p className="info-message">
        ❗ Bir hafta içinde aynı halısaha için en fazla <strong>3 farklı saate</strong> rezervasyon yapabilirsiniz.
      </p>

      <h3 className="section-title">Sahalar</h3>
      {slots.length > 0 ? (
        slots.map((field, index) => (
          <div key={index} className="field-container">
            <h4 className="field-title">{field.fieldName} ({field.capacity})</h4>
            <table className="slots-table">
              <thead>
                <tr>
                  <th>Saat Aralığı</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {field.timeSlots.map((slot, i) => (
                  <tr key={i} className={slot.isAvailable ? 'available' : 'unavailable'}>
                    <td>{slot.timeSlot}</td>
                    <td>{slot.isAvailable ? 'Boş' : 'Dolu'}</td>
                    <td>
                      {slot.status === 'pending' && slot.userEmail === localStorage.getItem('email') ? (
                        <span className="pending">Bekliyor</span>
                      ) : slot.isAvailable ? (
                        <button className="reserve-button" onClick={() => handleReservation(field.fieldName, slot.timeSlot)}>
                          Rezervasyon Yap
                        </button>
                      ) : (
                        <span className="unavailable-text">Dolu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="no-slots-message">Tarih Seçiniz.</p>
      )}

      {/* İşletme Fotoğrafları */}
      <div className="photo-section">
        <h3>İşletme Fotoğrafları</h3>
        {business.photos && business.photos.length > 0 ? (
          <div className="photo-gallery">
            {business.photos.map((photo, index) => (
              <img
                key={index}
                src={`http://localhost:5002/${photo}`}
                alt={`${business.businessName} Fotoğrafı`}
                className="thumbnail"
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
          </div>
        ) : (
          <p>Bu işletme için fotoğraf bulunmamaktadır.</p>
        )}
      </div>

      {/* Büyük Fotoğraf Görünümü */}
      {selectedPhoto && (
        <div className="overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal">
            <span className="close-button" onClick={() => setSelectedPhoto(null)}>&times;</span>
            <img src={`http://localhost:5002/${selectedPhoto}`} alt="Büyük Fotoğraf" className="large-photo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableSlotsTable;
