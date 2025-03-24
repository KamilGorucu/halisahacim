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
    // recaptchaToken: '',
  });
  const { login } = useContext(AuthContext); // AuthContext'ten `login` alınıyor.
  const navigate = useNavigate();

  // const handleRecaptchaVerify = (token) => {
  //   setFormData((prev) => ({ ...prev, recaptchaToken: token }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!formData.recaptchaToken) {
    //   alert('Lütfen reCAPTCHA doğrulamasını tamamlayın!');
    //   return;
    // }
    try {
      const response = await fetch(`${API_URL}/users/login`, {
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
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Kullanıcı Giriş</h2>
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
        {/* <Recaptcha onVerify={handleRecaptchaVerify} /> */}
        <button className="login-button" type="submit">Giriş Yap</button>
      </form>
    </div>
  );
};

export default UserLogin;
