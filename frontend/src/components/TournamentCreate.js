import React, { useState } from 'react';

const TournamentCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: { city: '', coordinates: [] },
    fee: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5002/api/tournaments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Turnuva başarıyla oluşturuldu!');
      } else {
        alert('Turnuva oluşturulamadı.');
      }
    } catch (error) {
      console.error('Turnuva oluşturulamadı:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Turnuva Oluştur</h2>
      <input
        type="text"
        placeholder="Turnuva Adı"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="date"
        placeholder="Tarih"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Şehir"
        value={formData.location.city}
        onChange={(e) => setFormData({
          ...formData,
          location: { ...formData.location, city: e.target.value },
        })}
        required
      />
      <input
        type="number"
        placeholder="Katılım Ücreti"
        value={formData.fee}
        onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
        required
      />
      <button type="submit">Oluştur</button>
    </form>
  );
};

export default TournamentCreate;
