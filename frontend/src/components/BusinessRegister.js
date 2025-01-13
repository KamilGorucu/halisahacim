import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '30%',
  height: '300px',
};

const BusinessRegister = () => {
  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    password: '',
    location: { city: '', coordinates: [] },
    workingHours: { start: '', end: '' },
    equipment: '',
  });
  const [mapPosition, setMapPosition] = useState({ lat: 41.0082, lng: 28.9784 }); // Varsayılan konum: İstanbul
  const navigate = useNavigate();

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMapPosition({ lat, lng });
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAGpwA7ia84Gv6fmwJru1Kv04l3n6Qzknk`
      );
      const data = await response.json();
  
      const city = data.results[0]?.address_components.find((comp) =>
        comp.types.includes('administrative_area_level_1')
      )?.long_name;
  
      setFormData((prevData) => ({
        ...prevData,
        location: { city: city || '', coordinates: [lng, lat] },
      }));
    } catch (error) {
      console.error('Konum alınamadı:', error);
      alert('Konum alınamadı. Lütfen tekrar deneyiniz.');
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5002/api/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('İşletme kaydı başarılı! Ödeme sayfasına yönlendiriliyorsunuz.');
        navigate('/payment'); // Ödeme sayfasına yönlendir
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt sırasında bir hata oluştu.');
    }
  };

  return (
    <div>
      <h2>İşletme Kayıt</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="İşletme Sahibi Adı"
          value={formData.ownerName}
          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="İşletme Adı"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <textarea
          placeholder="Ekipman Bilgileri"
          value={formData.equipment}
          onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
        />
        <h3>Harita Üzerinden Konum Belirle</h3>
        <LoadScript googleMapsApiKey="AIzaSyAGpwA7ia84Gv6fmwJru1Kv04l3n6Qzknk">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapPosition}
            zoom={14}
            onClick={handleMapClick}
          >
            <Marker position={mapPosition} />
          </GoogleMap>
        </LoadScript>
        <p>
          Seçilen Konum: Lat: {formData.location.coordinates[1] || '-'}, Lng: {formData.location.coordinates[0] || '-'}
        </p>
        <p>Şehir: {formData.location.city || 'Belirtilmemiş'}</p>
        <label>
          Çalışma Saatleri (Başlangıç):
          <input
            type="time"
            value={formData.workingHours.start}
            onChange={(e) =>
              setFormData({ ...formData, workingHours: { ...formData.workingHours, start: e.target.value } })
            }
            required
          />
        </label>
        <label>
          Çalışma Saatleri (Bitiş):
          <input
            type="time"
            value={formData.workingHours.end}
            onChange={(e) =>
              setFormData({ ...formData, workingHours: { ...formData.workingHours, end: e.target.value } })
            }
            required
          />
        </label>
        <button type="submit">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default BusinessRegister;
