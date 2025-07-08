import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Recaptcha from '../components/Recaptcha';
import '../css/BusinessRegister.css'
const API_URL = process.env.REACT_APP_API_URL;
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
    phone: '',
    address: '',
    city: '',
    location: { city: '', coordinates: [] },
    fields: [],
    equipment: '',
    photos: [],
    recaptchaToken: '',
  });
  const [fieldName, setFieldName] = useState(''); // Saha adı
  const [fieldCapacity, setFieldCapacity] = useState(''); // Kaça kaç oynanacak
  const [fieldPrice, setFieldPrice] = useState(''); // Fiyat alanı eklendi
  const [startHour, setStartHour] = useState(''); // Saat aralığı başlangıcı
  const [endHour, setEndHour] = useState(''); // Saat aralığı bitişi
  const [mapPosition, setMapPosition] = useState({ lat: 41.0082, lng: 28.9784 }); // Varsayılan konum: İstanbul
  const [selectedPhotos, setSelectedPhotos] = useState([]); // Fotoğraf seçimlerini tutmak için
  const navigate = useNavigate();

  const handleRecaptchaVerify = (token) => {
      setFormData((prev) => ({ ...prev, recaptchaToken: token }));
  };

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
    if (!formData.recaptchaToken) {
       alert("Lütfen reCAPTCHA doğrulamasını tamamlayın!");
       return;
    }
  
    // Form verilerini normalize et
    const cleanedFormData = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim().replace(/['"]+/g, ''),
      phone: formData.phone.trim().replace(/['"]+/g, ''),
      address: formData.address.trim().replace(/['"]+/g, ''),
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
      const response = await fetch(`${API_URL}/api/business/register`, {
        method: 'POST',
        body: formDataWithPhotos,
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('İşletme kaydı başarılı!');
        navigate('/login-business');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt sırasında bir hata oluştu.');
    }
  };  

  return (
    <div className="container py-4">
      <h2 className="text-success text-center mb-4">İşletme Kayıt</h2>
      <form onSubmit={handleSubmit}>
        {/* İşletme Bilgileri */}
        <div className="mb-3">
          <input type="text" className="form-control rounded" placeholder="İşletme Sahibi Adı" value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} required />
        </div>

        <div className="mb-3">
          <input type="text" className="form-control rounded" placeholder="İşletme Adı" value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
        </div>

        <div className="mb-3">
          <input type="email" className="form-control rounded" placeholder="E-posta" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>

        <div className="mb-3">
          <input type="password" className="form-control rounded" placeholder="Şifre" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        </div>

        <div className="mb-3">
          <input type="text" className="form-control rounded" placeholder="Telefon Numarası" value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        </div>

        <div className="mb-3">
          <input type="text" className="form-control rounded" placeholder="Adres" value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
        </div>

        <div className="mb-4">
          <textarea className="form-control rounded" rows={3} placeholder="Ekipman Bilgileri(Ayakkabı, eldiven vs)" value={formData.equipment}
            onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}></textarea>
        </div>

        <h4 className="text-primary">Sahalar</h4>

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Saha Adı (Kaç adet saha varsa Büyük Saha, Küçük Saha vb.)" value={fieldName}
              onChange={(e) => setFieldName(e.target.value)} />
          </div>
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Kaça Kaç (örn: 7'e 7)" value={fieldCapacity}
              onChange={(e) => setFieldCapacity(e.target.value)} />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" placeholder="Saatlik Ücret" value={fieldPrice}
              onChange={(e) => setFieldPrice(e.target.value)} />
          </div>
          <div className="col-md-1">
            <button type="button" className="btn btn-outline-success w-100" onClick={handleAddField}>+</button>
          </div>
        </div>

        {/* Eklenen sahalar */}
        {formData.fields.map((field, fieldIndex) => (
          <div key={fieldIndex} className="border rounded p-3 mb-3">
            <h5 className="text-success">{field.name} ({field.capacity}) - {field.price} TL</h5>
            <p className="mb-1 fw-bold">Saat Aralıkları:</p>
            <ul className="list-group mb-2">
              {field.workingHours.map((slot, slotIndex) => (
                <li key={slotIndex} className="list-group-item d-flex justify-content-between align-items-center">
                  {slot.start} - {slot.end}
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveTimeSlot(fieldIndex, slotIndex)}>Sil</button>
                </li>
              ))}
            </ul>
            <div className="row g-2">
              <div className="col">
                <input type="time" className="form-control" value={startHour} onChange={(e) => setStartHour(e.target.value)} />
              </div>
              <div className="col">
                <input type="time" className="form-control" value={endHour} onChange={(e) => setEndHour(e.target.value)} />
              </div>
              <div className="col">
                <button type="button" className="btn btn-outline-primary w-100" onClick={() => handleAddTimeSlot(fieldIndex)}>Saat Aralığı Ekle</button>
              </div>
            </div>
          </div>
        ))}

        {/* Fotoğraf */}
        <div className="mb-4">
          <label className="form-label fw-bold">Fotoğraf Yükle</label>
          <input type="file" className="form-control" multiple onChange={handleFileChange} />
        </div>

        {/* Harita */}
        <div className="mb-3">
          <h4 className="text-primary">Harita Üzerinden Konum Belirle</h4>
          <LoadScript googleMapsApiKey="AIzaSyAGpwA7ia84Gv6fmwJru1Kv04l3n6Qzknk">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapPosition}
              zoom={14}
              onClick={handleMapClick}>
              <Marker position={mapPosition} />
            </GoogleMap>
          </LoadScript>
          <p className="mt-2 small">
            Seçilen Konum: Lat: {formData.location.coordinates[1] || '-'}, Lng: {formData.location.coordinates[0] || '-'}
          </p>
          <p className="small">Şehir: {formData.location.city || 'Belirtilmemiş'}</p>
        </div>

        {/* Recaptcha */}
        <div className="mb-3">
          {<Recaptcha onVerify={handleRecaptchaVerify} />}
        </div>

        <button type="submit" className="btn btn-success w-100 rounded">Kaydet</button>
      </form>
    </div>
  );
};

export default BusinessRegister;
