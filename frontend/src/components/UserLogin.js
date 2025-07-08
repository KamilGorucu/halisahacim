import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import Recaptcha from '../components/Recaptcha';
import '../css/UserLogin.css';

const API_URL = process.env.REACT_APP_API_URL;

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    recaptchaToken: '',
  });
  const { login } = useContext(AuthContext); // AuthContext'ten `login` alınıyor.
  const navigate = useNavigate();

  const handleRecaptchaVerify = (token) => {
     setFormData((prev) => ({ ...prev, recaptchaToken: token }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if (!formData.recaptchaToken) {
       alert('Lütfen reCAPTCHA doğrulamasını tamamlayın!');
       return;
     }
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('email', formData.email); // E-posta bilgisini güncelleyin
        login(data.token, formData.email);
        alert('Giriş başarılı!');
        navigate('/profile/user'); // Kullanıcı profil sayfasına yönlendiriliyor.
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
        <h2 className="text-center mb-4 text-success">Kullanıcı Giriş</h2>
        <form className="w-100" style={{ maxWidth: '400px' }} onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-posta</label>
            <input
              type="email"
              className="form-control rounded"
              id="email"
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
              className="form-control rounded"
              id="password"
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          { <Recaptcha onVerify={handleRecaptchaVerify} /> }
          <button type="submit" className="btn btn-success w-100 rounded mt-3">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
