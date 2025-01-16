import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const BusinessLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Giriş işlemi için AuthContext'ten `login` fonksiyonunu al.

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Emaili normalize et
    const normalizedEmail = formData.email.trim().toLowerCase();
  
    try {
      const response = await fetch('http://localhost:5002/api/business/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: normalizedEmail }),
      });
  
      const data = await response.json();
      if (response.ok) {
        login(data.token);
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
    <form onSubmit={handleSubmit}>
      <h2>İşletme Giriş</h2>
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
      <button type="submit">Giriş Yap</button>
    </form>
  );
};

export default BusinessLogin;
