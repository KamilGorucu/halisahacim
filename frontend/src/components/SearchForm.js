import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SearchForm.css'

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
    <div className="search-form-container">
    <h2 className="search-form-title">Halısaha Ara</h2>
    <p className="search-form-description">Lütfen şehir adını girerek halısahaları arayın. Şehir adının baş harfi büyük olmalıdır.</p>
    <form className="search-form" onSubmit={handleSearch}>
      <input
        type="text"
        className="search-input"
        placeholder="Şehir Adı (Örn: İstanbul)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
      />
      <button type="submit" className="search-button">Ara</button>
    </form>
  </div>
  );
};

export default SearchForm;
