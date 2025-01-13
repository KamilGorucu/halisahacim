import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '', // Telefon numarası
    teams: '', // Oynadığı takımlar
    position:'',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <form onSubmit={handleSubmit}>
      <h2>Kullanıcı Kayıt</h2>
      <input
        type="text"
        placeholder="Ad Soyad"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        required
      />
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
      <input
        type="text"
        placeholder="Telefon"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <textarea
        placeholder="Oynadığınız Takımlar"
        value={formData.teams}
        onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
      />
      <input
        type="text"
        placeholder="Pozisyon"
        value={formData.position}
        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        required
      />
      <button type="submit">Kayıt Ol</button>
    </form>
  );
};

export default UserRegister;
