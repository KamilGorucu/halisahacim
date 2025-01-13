import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  // Kullanıcı giriş formu gönderildiğinde çalışacak
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API'ye giriş isteği gönder
      const response = await fetch('http://localhost:5002/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token); // Token'ı sakla
        alert('Giriş başarılı!');
        navigate('/profile/user'); // Kullanıcı profil sayfasına yönlendir
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
      <h2>Kullanıcı Giriş</h2>
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

export default UserLogin;
