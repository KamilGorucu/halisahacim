import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySelector from '../components/CitySelector';
// import '../css/UserRegister.css'; // CSS dosyasını dahil ettik
import Recaptcha from '../components/Recaptcha';

const API_URL = process.env.REACT_APP_API_URL;

const UserRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '', // Telefon numarası
    teams: '', // Oynadığı takımlar
    position: '',
    foot: '',
    city: '',
    photo: null,
    recaptchaToken: '',
  });
  const navigate = useNavigate();
  
  const handleRecaptchaVerify = (token) => {
    setFormData((prev) => ({ ...prev, recaptchaToken: token }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (city) => {
    setFormData((prev) => ({ ...prev, city }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if (!formData.recaptchaToken) {
       alert("Lütfen reCAPTCHA doğrulamasını tamamlayın!");
       return;
     }
     const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Kayıt başarılı!');
        navigate('/login-user'); // Giriş sayfasına yönlendir
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Kullanıcı Kayıt</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="mx-auto" style={{ maxWidth: "500px" }}>
        
        <div className="mb-3">
          <input type="text" name="fullName" placeholder="Ad Soyad" value={formData.fullName} onChange={handleChange} required className="form-control rounded-pill" />
        </div>

        <div className="mb-3">
          <input type="email" name="email" placeholder="E-posta" value={formData.email} onChange={handleChange} required className="form-control rounded-pill" />
        </div>

        <div className="mb-3">
          <input type="password" name="password" placeholder="Şifre" value={formData.password} onChange={handleChange} required className="form-control rounded-pill" />
        </div>

        <div className="mb-3">
          <input type="text" name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} required className="form-control rounded-pill" />
        </div>

        <div className="mb-3">
          <textarea name="teams" placeholder="Oynadığınız Takımlar" value={formData.teams} onChange={handleChange} className="form-control rounded" rows="3" />
        </div>

        <div className="mb-3">
          <select name="position" value={formData.position} onChange={handleChange} required className="form-select rounded-pill">
            <option value="">Pozisyon Seçin</option>
            <option value="Kaleci">Kaleci</option>
            <option value="Stoper">Stoper</option>
            <option value="Bek">Bek</option>
            <option value="Orta Saha">Orta Saha</option>
            <option value="Ofansif Orta Saha">Ofansif Orta Saha</option>
            <option value="Kanat">Kanat</option>
            <option value="Forvet">Forvet</option>
          </select>
        </div>

        <div className="mb-3">
          <select name="foot" value={formData.foot} onChange={handleChange} required className="form-select rounded-pill">
            <option value="">Kullandığınız Ayak</option>
            <option value="Sağ">Sağ Ayak</option>
            <option value="Sol">Sol Ayak</option>
            <option value="Çift">Çift Ayak</option>
          </select>
        </div>

        <div className="mb-3">
          {/* Şehir seçim bileşenini aynı bırakıyoruz */}
          <CitySelector selectedCity={formData.city} setSelectedCity={handleCityChange} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-muted">
            Profilinizde diğer kullanıcılara da gözükecek şekilde yüzünüzün net çıktığı bir fotoğraf yükleyiniz.
          </label>
          <input type="file" name="photo" accept="image/*" onChange={handleFileChange} className="form-control rounded-pill" />
        </div>
        { <Recaptcha onVerify={handleRecaptchaVerify} /> }
        <div className="d-grid">
          <button type="submit" className="btn btn-success rounded-pill">Kayıt Ol</button>
        </div>
      </form>
    </div>
  );
};

export default UserRegister;
