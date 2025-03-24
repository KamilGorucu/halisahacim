import React, { useState } from 'react';
import axios from 'axios';
import '../css/RatingForm.css';
const API_URL = process.env.REACT_APP_API_URL;
const RatingForm = ({ userId, onRatingSubmit }) => {
  const [score, setScore] = useState(5);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/rating/rate`, { userId, score }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setMessage('Puanınız kaydedildi!');
      onRatingSubmit(); // Yeniden yüklemek için callback fonksiyonu
    } catch (error) {
      console.error('Puanlama başarısız:', error);
      setMessage('Puanlama sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="rating-container">
      <h3>Kullanıcıyı Puanla</h3>
      <form onSubmit={handleSubmit}>
        <select value={score} onChange={(e) => setScore(Number(e.target.value))}>
          <option value={5}>⭐️⭐️⭐️⭐️⭐️ (Mükemmel)</option>
          <option value={4}>⭐️⭐️⭐️⭐️ (İyi)</option>
          <option value={3}>⭐️⭐️⭐️ (Orta)</option>
          <option value={2}>⭐️⭐️ (Zayıf)</option>
          <option value={1}>⭐️ (Çok Kötü)</option>
        </select>
        <button type="submit">Puan Ver</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RatingForm;
