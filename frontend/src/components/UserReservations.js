import React, { useState, useEffect } from 'react';

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/reservations/user', {
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

  return (
    <div>
      <h2>Rezervasyonlarım</h2>
      <ul>
        {reservations.map((res) => (
          <li key={res._id}>
            <p>İşletme: {res.business.businessName}</p>
            <p>Tarih: {new Date(res.date).toLocaleDateString()}</p>
            <p>Saat: {res.timeSlot}</p>
            <p>Durum: {res.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserReservations;
