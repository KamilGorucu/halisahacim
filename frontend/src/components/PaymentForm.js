import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const PaymentForm = () => {
  const { business } = useContext(AuthContext); // İşletme bilgilerini al.
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: business?.email || '', // İşletme e-postasını kullan.
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    amount: 1500, // Sabit abonelik ücreti.
  });

  if (!business) {
    return <p>İşletme bilgileri bulunamadı. Lütfen tekrar giriş yapın.</p>;
  }

  const handlePayment = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/payments/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, businessId: business.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ödeme sırasında bir hata oluştu.');
      }

      alert('Ödeme başarılı!');
      navigate('/profile/business'); // Profil sayfasına yönlendir.
    } catch (error) {
      console.error('Ödeme hatası:', error.message);
      alert(error.message || 'Bir hata oluştu.');
    }
  };

  return (
    <div>
      <h1>Ödeme Sayfası</h1>
      <p style={{ color: 'blue' }}>
        <strong>Aylık Abonelik Ücreti:</strong> 1500 TL <br />
        <strong>İlk Ay Ücretsizdir!(Kart bilgilerini diğer aylarda otomatik ödeme almak için alıyoruz.Şuan için bir ödeme alınmayacaktır!)</strong>
      </p>
      <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
        <div>
          <label>
            Kart Sahibinin Adı:
            <input
              type="text"
              placeholder="Kart Sahibinin Adı"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            E-posta Adresi:
            <input
              type="email"
              placeholder="E-posta Adresiniz"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Kart Numarası:
            <input
              type="text"
              placeholder="Kart Numarası"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Son Kullanma Tarihi:
            <input
              type="text"
              placeholder="Ay (MM)"
              value={formData.expireMonth}
              onChange={(e) => setFormData({ ...formData, expireMonth: e.target.value })}
              required
              style={{ width: '80px', marginRight: '10px' }}
            />
            <input
              type="text"
              placeholder="Yıl (YY)"
              value={formData.expireYear}
              onChange={(e) => setFormData({ ...formData, expireYear: e.target.value })}
              required
              style={{ width: '80px' }}
            />
          </label>
        </div>
        <div>
          <label>
            CVV:
            <input
              type="text"
              placeholder="CVV"
              value={formData.cvc}
              onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
              required
              style={{ width: '80px' }}
            />
          </label>
        </div>
        <div>
          <label>
            Ödenecek Tutar: <strong>{formData.amount}₺</strong>
          </label>
        </div>
        <button type="submit" style={{ marginTop: '20px' }}>Ödeme Yap</button>
      </form>
    </div>
  );
};

export default PaymentForm;
