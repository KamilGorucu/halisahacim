import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/AvailableSlotsTable.css';

const API_URL = process.env.REACT_APP_API_URL;

const AvailableSlotsTable = () => {
  const [slots, setSlots] = useState([]); // Boş ve dolu saatlerin listesi
  const location = useLocation();
  const business = location.state?.business || {}; // İşletme bilgileri
  const [weekOffset, setWeekOffset] = useState(0); // Bulunduğu haftadan kaç hafta sonrası ya da öncesi
  const [selectedDate, setSelectedDate] = useState(''); // Seçilen tarih
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [dayOfWeek, setDayOfWeek] = useState('Salı');
  const [timeSlot, setTimeSlot] = useState('22:00-23:00');
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [lastValidDate, setLastValidDate] = useState('');

  // Haftalık görünüm için tarih aralığı hesapla
  const getStartOfWeek = (offset = 0) => {
    const today = new Date();
    const day = today.getDay(); // 0-Pazar, 1-Pazartesi, ...
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getEndOfWeek = (offset = 0) => {
    const monday = new Date(getStartOfWeek(offset));
    const sunday = new Date(monday.setDate(monday.getDate() + 6));
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString().split('T')[0];
  };

  const fetchWeeklySlots = useCallback(async () => {
    try {
      const startDate = getStartOfWeek(weekOffset);
      const endDate = getEndOfWeek(weekOffset);

      const response = await fetch(
        `${API_URL}/api/reservations/weekly-user?businessId=${business._id}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSlots(data.weeklyData || []);
      } else {
        alert(data.message || 'Haftalık saat aralıkları alınamadı.');
      }
    } catch (error) {
      console.error('Haftalık saat aralıkları alınamadı:', error);
    }
  }, [weekOffset, business._id]);

  useEffect(() => {
    fetchWeeklySlots();
  }, [fetchWeeklySlots]);

  const handleWeekChange = (direction) => {
    setWeekOffset((prev) => prev + direction);
  };

  // Rezervasyon yapma işlemi
  const handleReservation = async (fieldName, timeSlot, date) => {
    try {
      const response = await fetch(`${API_URL}/api/reservations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userEmail: localStorage.getItem('email'),
          businessId: business._id,
          date,
          timeSlot,
          fieldName,
        }),
      });

      if (response.ok) {
        alert('Rezervasyon isteği başarıyla gönderildi! Mesaj kutunuzu kontrol ediniz!');
        fetchWeeklySlots(); // ✅ Haftalık görünüm yenilensin
      } else {
        const data = await response.json();
        alert(data.message || 'Rezervasyon sırasında bir hata oluştu.');
      }
    } catch (error) {
      console.error('Rezervasyon yapılamadı:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Geçersiz Tarih';
    const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const handleSubscriptionRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/subscription/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          businessId: business._id,
          fieldName,
          dayOfWeek,
          timeSlot,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubscriptionMessage('✅ Abonelik isteği başarıyla gönderildi.');
      } else {
        setSubscriptionMessage(data.message || 'Hata oluştu.');
      }
    } catch (error) {
      console.error('Abonelik isteği gönderilemedi:', error);
      setSubscriptionMessage('Sunucu hatası.');
    }
  };

  return (
    <div className="container my-4">
      <h3 className="text-success mb-3">{business.businessName}</h3>

      <div className="alert alert-warning small">
        <i className="bi bi-info-circle-fill me-2"></i> Bir hafta içinde aynı halısaha için en fazla <strong>3 farklı saate</strong> rezervasyon yapabilirsiniz.
      </div>

      {/* Saha ve Slotlar */}
      <h5 className="mt-4">Sahalar</h5>
      <div className="week-navigation mb-3">
        <button className="btn btn-secondary me-2" onClick={() => handleWeekChange(-1)}>Önceki Hafta</button>
        <button className="btn btn-secondary" onClick={() => handleWeekChange(1)}>Sonraki Hafta</button>
      </div>
      {slots.length > 0 ? (
        slots.map((field, index) => (
          <div key={index} className="card my-3">
            <div className="card-header bg-success text-white">
              {field.fieldName} ({field.capacity})
            </div>
            <div className="table-responsive card-body p-0">
              <table className="weekly-table table mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tarih</th>
                    {field.weeklyData[0]?.daySlots.map((slot, i) => (
                      <th key={i}>{slot.timeSlot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {field.weeklyData.map((day, i) => (
                    <tr key={i}>
                      <td>{formatDate(day.date)}</td>
                      {day.daySlots.map((slot, j) => {
                        const today = new Date().toISOString().split('T')[0];
                        const slotDate = day.date;

                        return (
                          <td key={j}>
                            {slotDate < today ? (
                              <span className="text-muted">Rezervasyon Yapılamaz</span>
                            ) : slot.status === 'available' ? (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleReservation(field.fieldName, slot.timeSlot, day.date)}
                              >
                                Rezervasyon Yap
                              </button>
                            ) : (
                              <span className="text-danger">Dolu</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">Yükleniyor veya veri bulunamadı.</p>
      )}

      {/* İşletme Fotoğrafları */}
      <h5 className="mt-5">İşletme Fotoğrafları</h5>
      {business.photos && business.photos.length > 0 ? (
        <div className="row">
          {business.photos.map((photo, index) => (
            <div key={index} className="col-6 col-md-3 mb-3">
              <img
                src={`${API_URL}/${photo}`}
                alt={`Fotoğraf ${index + 1}`}
                className="img-thumbnail"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedPhoto(photo)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">Bu işletme için fotoğraf bulunmamaktadır.</p>
      )}

      {/* Fotoğraf Modal */}
      {selectedPhoto && (
        <div className="modal d-block" tabIndex="-1" onClick={() => setSelectedPhoto(null)} style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-white">
              <div className="modal-body p-0">
                <img src={`${API_URL}/${selectedPhoto}`} className="img-fluid w-100" alt="Büyük Fotoğraf" />
              </div>
              <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-2" aria-label="Close" onClick={() => setSelectedPhoto(null)}></button>
            </div>
          </div>
        </div>
      )}

      {/* Abonelik Formu */}
      <div className="mt-5">
        <h5>Abonelik İsteği Gönder</h5>
        <div className="alert alert-info small">
          <i className="bi bi-exclamation-circle-fill me-2"></i> Bu işletme için yalnızca 1 kez abonelik isteği gönderebilirsiniz.
        </div>
        <form onSubmit={handleSubscriptionRequest} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Saha Seçin:</label>
            <select className="form-select" value={fieldName} onChange={(e) => setFieldName(e.target.value)} required>
              <option value="">-- Saha Seçin --</option>
              {business.fields?.map((f, i) => (
                <option key={i} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Gün:</label>
            <select className="form-select" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} required>
              {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Saat Aralığı:</label>
            <select className="form-select" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required>
              <option value="">-- Saat Seçin --</option>
              {slots
              .filter(s => s.fieldName === fieldName)
              .flatMap(field =>
                field.weeklyData.flatMap(day =>
                  day.daySlots
                    .filter(slot => slot && slot.isAvailable && !slot.hasSubscription)
                    .map(slot => slot.timeSlot)
                )
              )
              .filter((value, index, self) => self.indexOf(value) === index) // Aynı saatleri tekilleştir
              .map((time, idx) => (
                <option key={idx} value={time}>{time}</option>
            ))}
            </select>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100">Abonelik Talep Et</button>
            {subscriptionMessage && <p className="text-success mt-2">{subscriptionMessage}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvailableSlotsTable;
