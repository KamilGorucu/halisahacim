import React, { useState, useEffect } from 'react';

const BusinessReservationTable = () => {
  const [reservations, setReservations] = useState([]);

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
        alert('Rezervasyon onaylandı!');
        fetchReservations(); // Listeyi yenile
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
      } else {
        alert('Rezervasyon reddedilemedi.');
      }
    } catch (error) {
      console.error('Rezervasyon reddedilemedi:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Rezervasyon Yönetimi</h2>
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
    </div>
  );
};

export default BusinessReservationTable;
