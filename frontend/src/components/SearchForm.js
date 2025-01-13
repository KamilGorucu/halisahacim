import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = () => {
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5002/api/business/search?city=${city}`);
      const data = await response.json();

      if (response.ok) {
        navigate('/results', { state: { results: data } }); // Arama sonuçlarını /results sayfasına gönder
      } else {
        alert(data.message || 'Şehir bulunamadı.');
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  return (
    <div>
      <h2>Halısaha Ara</h2>
      <p>Lütfen şehir adını girerek halısahaları arayın. Şehir adının baş harfi büyük olmalıdır.</p>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Şehir Adı (Örn: İstanbul)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <button type="submit">Ara</button>
      </form>
    </div>
  );
};

export default SearchForm;
