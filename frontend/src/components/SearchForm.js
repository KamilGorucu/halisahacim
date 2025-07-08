import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SearchForm.css'
import CitySelector from './CitySelector';

const API_URL = process.env.REACT_APP_API_URL;

const SearchForm = () => {
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    const encodedCity = encodeURIComponent(city.trim());
    try {
      const response = await fetch(`${API_URL}/api/business/search?city=${encodedCity}`);
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
    <div className="container my-5">
      <h2 className="text-center text-success mb-2">Halısaha Ara</h2>
      <p className="text-center text-muted mb-4">Lütfen şehir seçerek halısahaları arayın.</p>

      <form onSubmit={handleSearch} className="mx-auto" style={{ maxWidth: '500px' }}>
        <div className="mb-3">
          {/* CitySelector bileşeni bootstrap form yapısına dahil ediliyor */}
          <CitySelector selectedCity={city} setSelectedCity={setCity} />
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-success rounded-pill">Ara</button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
