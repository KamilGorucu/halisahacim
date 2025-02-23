import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Recaptcha from './Recaptcha';
import '../css/BusinessRegister.css'

const containerStyle = {
  width: '100%',
  height: '300px',
};

const BusinessRegister = () => {
  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    password: '',
    location: { city: '', coordinates: [] },
    fields: [],
    equipment: '',
    photos: [],
  });
  const [fieldName, setFieldName] = useState(''); // Saha adı
  const [fieldCapacity, setFieldCapacity] = useState(''); // Kaça kaç oynanacak
  const [fieldPrice, setFieldPrice] = useState(''); // Fiyat alanı eklendi
  const [startHour, setStartHour] = useState(''); // Saat aralığı başlangıcı
  const [endHour, setEndHour] = useState(''); // Saat aralığı bitişi
  const [mapPosition, setMapPosition] = useState({ lat: 41.0082, lng: 28.9784 }); // Varsayılan konum: İstanbul
  const [selectedPhotos, setSelectedPhotos] = useState([]); // Fotoğraf seçimlerini tutmak için
  // const [recaptchaToken, setRecaptchaToken] = useState('');
  const navigate = useNavigate();

  // Saha ekleme
  const handleAddField = () => {
    if (fieldName && fieldCapacity && fieldPrice) {
      setFormData((prevData) => ({
        ...prevData,
        fields: [...prevData.fields, { name: fieldName, capacity: fieldCapacity, price: fieldPrice, workingHours: [] }],
      }));
      setFieldName('');
      setFieldCapacity('');
      setFieldPrice('');
    } else {
      alert('Lütfen saha adı, kapasite ve fiyatı girin.');
    }
  };

  /// Saat aralığı ekleme (benzersiz kontrolü ile)
  const handleAddTimeSlot = (fieldIndex) => {
    if (startHour && endHour) {
      setFormData((prevData) => {
        const updatedFields = [...prevData.fields];
        const workingHours = updatedFields[fieldIndex].workingHours;

        // Benzersiz saat aralığı kontrolü
        const isDuplicate = workingHours.some(
          (slot) => slot.start === startHour && slot.end === endHour
        );

        if (isDuplicate) {
          // alert('Bu saat aralığı zaten mevcut.');
          return prevData;
        }

        workingHours.push({ start: startHour, end: endHour });
        return { ...prevData, fields: updatedFields };
      });
      setStartHour('');
      setEndHour('');
    } else {
      alert('Lütfen başlangıç ve bitiş saatlerini girin.');
    }
  };

  // Saat aralığı silme (belirli saha için)
  const handleRemoveTimeSlot = (fieldIndex, slotIndex) => {
    setFormData((prevData) => {
      const updatedFields = [...prevData.fields];
      updatedFields[fieldIndex].workingHours.splice(slotIndex, 1);
      return { ...prevData, fields: updatedFields };
    });
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
    // if (!recaptchaToken) {
    //   alert("Lütfen reCAPTCHA doğrulamasını tamamlayın!");
    //   return;
    // }
  
    // Form verilerini normalize et
    const cleanedFormData = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
    password: formData.password.trim().replace(/['"]+/g, ''),
    ownerName: formData.ownerName.trim().replace(/['"]+/g, ''),
    businessName: formData.businessName.trim().replace(/['"]+/g, ''),
    equipment: formData.equipment.trim().replace(/['"]+/g, ''),
    };
  
    const formDataWithPhotos = new FormData();
  
    Object.keys(cleanedFormData).forEach((key) => {
      if (key === 'photos') {
        selectedPhotos.forEach((photo) => formDataWithPhotos.append('photos', photo));
      } else if (typeof cleanedFormData[key] === 'object') {
        formDataWithPhotos.append(key, JSON.stringify(cleanedFormData[key]));
      } else {
        formDataWithPhotos.append(key, cleanedFormData[key]);
      }
    });
  
    try {
      const response = await fetch('http://localhost:5002/api/business/register', {
        method: 'POST',
        body: formDataWithPhotos,
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('İşletme kaydı başarılı!');
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
    <div className="business-register-container">
      <h2>İşletme Kayıt</h2>
      <form onSubmit={handleSubmit} className="business-register-form">
        {/* İşletme Bilgileri */}
        <input
          type="text"
          placeholder="İşletme Sahibi Adı"
          value={formData.ownerName}
          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="İşletme Adı"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          required
          className="input-field"
        />
        <input
          type="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="input-field"
        />
        <textarea
          placeholder="Ekipman Bilgileri"
          value={formData.equipment}
          onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
          className="textarea-field"
        />

        <h3>Sahalar</h3>
        <div className='field-container'>
          <input
            type="text"
            placeholder="Saha Adı(Kaç adet saha varsa Saha1 vb.)"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            className="input-field"
            />
          <input
            type="text"
            placeholder="Kaça Kaç (örn: 7'e 7)"
            value={fieldCapacity}
            onChange={(e) => setFieldCapacity(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Saatlik Ücret"
            value={fieldPrice}
            onChange={(e) => setFieldPrice(e.target.value)}
            className="input-field"
          />
          <button type="button" onClick={handleAddField} className="add-field-button">
            Saha Ekle
          </button>
        </div>
        <ul className='field-list'>
          {formData.fields.map((field, fieldIndex) => (
            <li key={fieldIndex} className="field-item">
              <h4 className='field-name'>{field.name} ({field.capacity})</h4>
              <p className='field-price'>Fiyat: {field.price} TL</p>
              <p className='field-hours-title'>Saat Aralıkları:</p>
              <ul className='time-slot-list'>
                {field.workingHours.map((slot, slotIndex) => (
                  <li key={slotIndex} className="time-slot-item">
                    {slot.start} - {slot.end}
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(fieldIndex, slotIndex)}
                      className="delete-time-slot"
                    >
                      Sil
                    </button>
                  </li>
                ))}
              </ul>
              <div className='time-slot-inputs'>
                <input
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="time-input"
                />
                <input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="time-input"
                />
                <button type="button" onClick={() => handleAddTimeSlot(fieldIndex)} className="add-time-slot">
                  Saat Aralığı Ekle
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Fotoğraf Yükleme */}
        <h3>Fotoğraflar</h3>
        <input type="file" multiple onChange={handleFileChange} className="field-input" />

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
        {/* <Recaptcha onVerify={(token) => setRecaptchaToken(token)} /> */}
        <button type="submit" className='submit-button'>Kaydet</button>
      </form>
    </div>
  );
};

export default BusinessRegister;
