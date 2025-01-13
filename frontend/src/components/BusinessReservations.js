import React, { useState, useEffect } from 'react';

const BusinessReservations = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/reservations/business', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error('Rezervasyonlar alınamadı:', error);
      }
    };
    fetchReservations();
  }, []);

  const handleStatusChange = async (reservationId, status) => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reservationId, status }),
      });
      const data = await response.json();
      alert(data.message);
      setReservations((prev) =>
        prev.map((res) =>
          res._id === reservationId ? { ...res, status: data.reservation.status } : res
        )
      );
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  return (
    <div>
      <h2>Rezervasyon İstekleri</h2>
      {reservations.map((res) => (
        <div key={res._id}>
          <p>Kullanıcı: {res.user.fullName}</p>
          <p>Tarih: {new Date(res.date).toLocaleDateString()}</p>
          <p>Saat: {res.timeSlot}</p>
          <button onClick={() => handleStatusChange(res._id, 'approved')}>Onayla</button>
          <button onClick={() => handleStatusChange(res._id, 'rejected')}>Reddet</button>
        </div>
      ))}
    </div>
  );
};

export default BusinessReservations;
