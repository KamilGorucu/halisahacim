import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../css/BusinessLogin.css';
import Recaptcha from '../components/Recaptcha';

const API_URL = process.env.REACT_APP_API_URL;

const BusinessLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    recaptchaToken: '',
  });
  const navigate = useNavigate();
  const { login, setBusiness } = useContext(AuthContext); // Giriş işlemi için AuthContext'ten `login` fonksiyonunu al.
  
  const handleRecaptchaVerify = (token) => {
      setFormData((prev) => ({ ...prev, recaptchaToken: token }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recaptchaToken) {
       alert("Lütfen reCAPTCHA doğrulamasını tamamlayın!");
       return;
    }
    // Emaili normalize et
    const normalizedEmail = formData.email.trim().toLowerCase();
  
    try {
      const response = await fetch(`${API_URL}/api/business/login`, {
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
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <form className="w-100" style={{ maxWidth: '400px' }} onSubmit={handleSubmit}>
          <h2 className="text-center mb-4 text-success">İşletme Giriş</h2>
    
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-posta</label>
            <input
              type="email"
              id="email"
              className="form-control rounded"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              />
          </div>
    
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Şifre</label>
            <input
              type="password"
              id="password"
              className="form-control rounded"
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              />
          </div>
    
          { <Recaptcha onVerify={handleRecaptchaVerify} /> }
    
          <button type="submit" className="btn btn-success w-100 rounded mt-3">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessLogin;
