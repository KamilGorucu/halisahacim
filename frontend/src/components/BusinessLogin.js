import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import Recaptcha from './Recaptcha';
import '../css/BusinessLogin.css';
const API_URL = process.env.REACT_APP_API_URL;
const BusinessLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  // const [recaptchaToken, setRecaptchaToken] = useState('');
  const navigate = useNavigate();
  const { login, setBusiness } = useContext(AuthContext); // Giriş işlemi için AuthContext'ten `login` fonksiyonunu al.

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!recaptchaToken) {
    //   alert("Lütfen reCAPTCHA doğrulamasını tamamlayın!");
    //   return;
    // }
    // Emaili normalize et
    const normalizedEmail = formData.email.trim().toLowerCase();
  
    try {
      const response = await fetch(`${API_URL}/business/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: normalizedEmail, }),
      });
  
      const data = await response.json();
      if (response.ok) {
        login(data.token);
        setBusiness({
          id: data.business.id,
          email: data.business.email,
          isActive: data.isActive, // Burada `isActive` güncellendi.
        });
        if (!data.isActive) {
          alert('Ödemeniz gerçekleşmeden işletmeniz aktif olmayacaktır. Ödeme sayfasına yönlendiriliyorsunuz.');
          navigate('/payment');
        } else {
          alert('Giriş başarılı!');
          navigate('/profile/business');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      alert('Giriş sırasında bir hata oluştu.');
    }
  };  

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">İşletme Giriş</h2>
        <input
          type="email"
          className="login-input"
          placeholder="E-posta"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="Şifre"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
         {/* <Recaptcha onVerify={(token) => setRecaptchaToken(token)} /> */}
        <button className="login-button" type="submit">Giriş Yap</button>
      </form>
    </div>
  );
};

export default BusinessLogin;
