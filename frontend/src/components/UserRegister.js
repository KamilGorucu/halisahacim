import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/UserRegister.css'; // CSS dosyasını dahil ettik
import Recaptcha from '../components/Recaptcha';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '', // Telefon numarası
    teams: '', // Oynadığı takımlar
    position: '',
    recaptchaToken: '',
  });
  const navigate = useNavigate();
  
  const handleRecaptchaVerify = (token) => {
    setFormData((prev) => ({ ...prev, recaptchaToken: token }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recaptchaToken) {
      alert("Lütfen reCAPTCHA doğrulamasını tamamlayın!");
      return;
    }
    try {
      const response = await fetch('http://localhost:5002/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    <div className="user-register-container">
      <h2>Kullanıcı Kayıt</h2>
      <form onSubmit={handleSubmit} className="user-register-form">
        <input
          type="text"
          placeholder="Ad Soyad"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          className="user-input"
        />
        <input
          type="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="user-input"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="user-input"
        />
        <input
          type="text"
          placeholder="Telefon"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          className="user-input"
        />
        <textarea
          placeholder="Oynadığınız Takımlar"
          value={formData.teams}
          onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
          className="user-textarea"
        />
        <input
          type="text"
          placeholder="Pozisyon"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          required
          className="user-input"
        />
        <Recaptcha onVerify={handleRecaptchaVerify} />
        <button type="submit" className="user-register-button">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default UserRegister;
