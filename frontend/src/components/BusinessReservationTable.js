import React, { useState, useEffect } from 'react';

const BusinessReservationTable = () => {
  const [reservations, setReservations] = useState([]);
  // const [slots, setSlots] = useState([]); // Boş ve dolu saatlerin listesi
  const [weeklySlots, setWeeklySlots] = useState([]);

  // Rezervasyonları API'den getir
  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `http://localhost:5002/api/reservations/business-reservations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // İşletme token'ı
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setReservations(data.reservations);
      } else {
        alert(data.message || 'Rezervasyonlar alınamadı.');
      }
    } catch (error) {
      console.error('Rezervasyonlar alınamadı:', error);
    }
  };

  // const fetchSlots = async () => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:5002/api/reservations/available-slots?businessId=${localStorage.getItem('businessId')}&date=${new Date().toISOString().split('T')[0]}`
  //     );
  //     const data = await response.json();
  //     if (response.ok) {
  //       setSlots(data); // Boş ve dolu saatleri kaydet
  //     } else {
  //       alert(data.message || 'Saat bilgileri alınamadı.');
  //     }
  //   } catch (error) {
  //     console.error('Saat bilgileri alınamadı:', error);
  //   }
  // };

  // Rezervasyonu onayla
  
  const handleApprove = async (reservationId) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ reservationId }),
      });

      if (response.ok) {
        alert('Rezervasyon isteği gönderildi! Geri bildirim işletme tarafından sağlanacaktır.');
        fetchReservations(); // Listeyi yenile
        fetchWeeklySlots();
      } else {
        alert('Rezervasyon onaylanamadı.');
      }
    } catch (error) {
      console.error('Rezervasyon onaylanamadı:', error);
    }
  };

  // Rezervasyonu reddet
  const handleReject = async (reservationId) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/reject', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ reservationId }),
      });

      if (response.ok) {
        alert('Rezervasyon reddedildi!');
        fetchReservations(); // Listeyi yenile
        fetchWeeklySlots();
      } else {
        alert('Rezervasyon reddedilemedi.');
      }
    } catch (error) {
      console.error('Rezervasyon reddedilemedi:', error);
    }
  };

  const fetchWeeklySlots = async () => {
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
      console.log('Backend Weekly Data:', data); // Gelen veriyi kontrol edin
      if (response.ok) {
        setWeeklySlots(data);
      } else {
        alert(data.message || 'Rezervasyonlar alınamadı.');
      }
    } catch (error) {
      console.error('Rezervasyonlar alınamadı:', error);
    }
  };

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

  useEffect(() => {
    fetchReservations();
    // fetchSlots(); // Saat bilgilerini al
    fetchWeeklySlots();
  }, []);

  return (
    <div>
      <h2>Rezervasyon Yönetimi</h2>

      {/* Rezervasyonları Görüntüle */}
      <table>
        <thead>
          <tr>
            <th>Kullanıcı</th>
            <th>Tarih</th>
            <th>Saat</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res._id}>
              <td>{res.user.fullName} ({res.user.email})</td>
              <td>{new Date(res.date).toLocaleDateString()}</td>
              <td>{res.timeSlot}</td>
              <td>{res.status}</td>
              <td>
                {res.status === 'pending' ? (
                  <>
                    <button onClick={() => handleApprove(res._id)}>Onayla</button>
                    <button onClick={() => handleReject(res._id)}>Reddet</button>
                  </>
                ) : (
                  <span>{res.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Haftalık Saat Aralıkları */}
      <h3>Haftalık Saat Görünümü</h3>
      <table>
        <thead>
          <tr>
            <th>Saat</th>
            {weeklySlots.length > 0 && weeklySlots[0].days.map((day, index) => (
              <th key={index}>{day.date} <br /> {day.dayName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeklySlots.map((slot) => (
            <tr key={slot.timeSlot}>
              <td>{slot.timeSlot}</td>
              {slot.days.map((day, index) => (
                <td
                  key={index}
                  style={{ backgroundColor: day.isAvailable ? '#d4edda' : '#f8d7da' }}
                  title={day.isAvailable ? 'Boş' : `Dolu: ${day.user?.fullName || ''}`}
                >
                  {day.isAvailable ? 'Boş' : 'Dolu'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessReservationTable;
