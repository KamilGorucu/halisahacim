import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChallengeCreate = () => {
  const [formData, setFormData] = useState({
    type: 'rakip-bul',
    details: '',
    contactInfo: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5002/api/challenges/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('İlan başarıyla oluşturuldu!');
        navigate('/challenges'); // İlanlar sayfasına yönlendir
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('İlan oluşturulamadı:', error);
      alert('Bir hata oluştu.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>İlan Oluştur</h2>
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        required
      >
        <option value="rakip-bul">Rakip Bul</option>
        <option value="eksik-oyuncu">Eksik Oyuncu</option>
      </select>
      <textarea
        placeholder="İlan Detayları"
        value={formData.details}
        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="İletişim Bilgileri"
        value={formData.contactInfo}
        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
        required
      />
      <button type="submit">Oluştur</button>
    </form>
  );
};

export default ChallengeCreate;
