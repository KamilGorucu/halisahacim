import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserReservation = ({ businessId }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableTimes = async (date) => {
    try {
      const response = await axios.get(`/api/available-times?date=${date}&businessId=${businessId}`);
      setTimeSlots(response.data.times);
    } catch (error) {
      console.error('Saatler alınırken hata oluştu:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/reservations/user-reservations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReservations(data.reservations);
      } else {
        alert('Rezervasyonlar alınamadı.');
      }
    } catch (error) {
      console.error('Rezervasyonlar alınamadı:', error);
    }
  };

  const handleReservation = async (timeSlot) => {
    try {
      await axios.post('/api/reservations', { date: selectedDate, timeSlot, businessId });
      fetchAvailableTimes(selectedDate); // Rezervasyon sonrası saatleri güncelle
    } catch (error) {
      console.error('Rezervasyon sırasında hata oluştu:', error);
    }
  };

  return (
    <div>
      <h1>Rezervasyon Yap</h1>
      <label htmlFor="date">Tarih Seç:</label>
      <input
        type="date"
        id="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <div className="time-slots">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            className={slot.available ? 'available' : 'unavailable'}
            disabled={!slot.available}
            onClick={() => handleReservation(slot.time)}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserReservation;
