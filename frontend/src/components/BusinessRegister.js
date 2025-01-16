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
    workingHours: [],
    equipment: '',
    photos: [],
  });
  const [mapPosition, setMapPosition] = useState({ lat: 41.0082, lng: 28.9784 }); // Varsayılan konum: İstanbul
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]); // Fotoğraf seçimlerini tutmak için
  const [selectedDate, setSelectedDate] = useState(''); // Tarih seçimi

  const navigate = useNavigate();

  const handleAddTimeSlot = () => {
    if (startHour && endHour) {
      setFormData((prevData) => ({
        ...prevData,
        workingHours: [...prevData.workingHours, { start: startHour, end: endHour }],
      }));
      setStartHour('');
      setEndHour('');
    } else {
      alert('Lütfen başlangıç ve bitiş saatlerini girin.');
    }
  };

  const handleRemoveTimeSlot = (slot) => {
    setFormData((prevData) => ({
      ...prevData,
      workingHours: prevData.workingHours.filter((item) => item !== slot),
    }));
  };

  const handleFileChange = (e) => {
    setSelectedPhotos([...e.target.files]); // Seçilen dosyaları kaydet
  };

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
  
    // Form verilerini normalize et
    const cleanedFormData = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      password: formData.password.replace(/['"]+/g, ''),
      ownerName: formData.ownerName.replace(/['"]+/g, ''),
      businessName: formData.businessName.replace(/['"]+/g, ''),
      equipment: formData.equipment.replace(/['"]+/g, ''),
    };
  
    const formDataWithPhotos = new FormData();
  
    Object.keys(cleanedFormData).forEach((key) => {
      if (key === 'photos') {
        selectedPhotos.forEach((photo) => formDataWithPhotos.append('photos', photo));
      } else {
        formDataWithPhotos.append(key, JSON.stringify(cleanedFormData[key]));
      }
    });
  
    try {
      const response = await fetch('http://localhost:5002/api/business/register', {
        method: 'POST',
        body: formDataWithPhotos,
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('İşletme kaydı başarılı! Ödeme sayfasına yönlendiriliyorsunuz.');
        navigate('/payment');
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
        {/* İşletme Bilgileri */}
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

        {/* Saat Aralığı Seçimi */}
        <h3>Saat Aralıkları</h3>
        <div>
          <label>Başlangıç Saati:</label>
          <input
            type="time"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          />
          <label>Bitiş Saati:</label>
          <input
            type="time"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
          />
          <button type="button" onClick={handleAddTimeSlot}>
            Saat Aralığı Ekle
          </button>
        </div>
        <ul>
          {formData.workingHours.map((slot, index) => (
            <li key={index}>
              {slot.start} - {slot.end}{' '}
              <button type="button" onClick={() => handleRemoveTimeSlot(slot)}>
                Kaldır
              </button>
            </li>
          ))}
        </ul>

        {/* Fotoğraf Yükleme */}
        <h3>Fotoğraflar</h3>
        <input type="file" multiple onChange={handleFileChange} />

        {/* Harita */}
        <h3>Harita Üzerinden Konum Belirle</h3>
        <LoadScript googleMapsApiKey="AIzaSyAGpwA7ia84Gv6fmwJru1Kv04l3n6Qzknk">
          <GoogleMap mapContainerStyle={containerStyle} center={mapPosition} zoom={14} onClick={handleMapClick}>
            <Marker position={mapPosition} />
          </GoogleMap>
        </LoadScript>
        <p>
          Seçilen Konum: Lat: {formData.location.coordinates[1] || '-'}, Lng: {formData.location.coordinates[0] || '-'}
        </p>
        <p>Şehir: {formData.location.city || 'Belirtilmemiş'}</p>
        <button type="submit">Kaydet</button>
      </form>
    </div>
  );
};

export default BusinessRegister;
