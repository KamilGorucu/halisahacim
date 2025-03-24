import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useEffect } from 'react';
import '../css/PaymentForm.css';
const API_URL = process.env.REACT_APP_API_URL;
const PaymentForm = () => {
  const { business } = useContext(AuthContext); // İşletme bilgilerini al.
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  console.log("🟡 Business Değeri:", business);
  console.log("🔵 Business ID:", business?.id || business?._id); // Hangi ID geldiğini test et
  
  useEffect(() => {
    if (business?.id) {
        setFormData((prevFormData) => ({
            ...prevFormData,
            businessId: business.id, // ✅ ID'yi sonradan ekle
        }));
    }
}, [business]); // business değiştikçe çalıştır!

  const [formData, setFormData] = useState({
    fullName: '',
    email: business?.email || '', // İşletme e-postasını kullan.
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    amount: 1500, // Sabit abonelik ücreti.
    businessId: business?._id || business?.id || '', // İşletme ID’yi kontrol et
  });

  if (!business || !business.id) {
    return <p className='payment-error'>İşletme bilgileri bulunamadı. Lütfen tekrar giriş yapın.</p>;
  }

  // Kart Numarasını Maskeleme (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value) => value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
  
  // Son Kullanma Tarihini (MM/YY) Formatına Getirme
  const formatExpiry = (value) => value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})/, '$1/');

  const handlePayment = async () => {
    console.log('📌 Gönderilen Ödeme Bilgileri:', formData); // Debugging için
    console.log('📌 Güncellenmiş Business ID:', formData.businessId);
    try {
      if (!formData.businessId) {
        throw new Error('❌ İşletme ID eksik! Lütfen tekrar giriş yapın.');
      }

      const response = await fetch(`${API_URL}/payments/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          amount: formData.amount,
          businessId: formData.businessId || business?.id,
          cardNumber: formData.cardNumber.replace(/\s/g, ''), // Boşlukları kaldır
          expireMonth: formData.expireMonth,
          expireYear: formData.expireYear,
          cvc: formData.cvc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Ödeme sırasında bir hata oluştu.');
        return;
      }

      alert('Ödeme başarılı!');
      navigate('/profile/business'); 
    } catch (error) {
      console.error('Ödeme hatası:', error.message);
      setErrorMessage(error.message || 'Bir hata oluştu.');
    }
  };


  return (
    <div className="payment-container">
      <h1 className="payment-title">Ödeme Sayfası</h1>
      <p className="payment-info">
        <strong>Aylık Abonelik Ücreti:</strong> 1500 TL <br />
        <strong>İlk Ay Ücretsizdir!</strong>
      </p>
      <form className="payment-form" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
        <div className="payment-field">
          <label>Kart Sahibinin Adı:</label>
          <input
            type="text"
            placeholder="Kart Sahibinin Adı"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>
        <div className="payment-field">
          <label>E-posta Adresi:</label>
          <input
            type="email"
            placeholder="E-posta Adresiniz"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="payment-field">
          <label>Kart Numarası:</label>
          <input
            type="text"
            placeholder="XXXX XXXX XXXX XXXX"
            value={formData.cardNumber}
            onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
            maxLength="19"
            required
          />
        </div>
        <div className="payment-field payment-expiry">
          <label>Son Kullanma Tarihi:</label>
          <div className="expiry-container">
          <input
              type="text"
              placeholder="(Ay)MM"
              value={formData.expireMonth}
              onChange={(e) => setFormData({ ...formData, expireMonth: e.target.value })}
              maxLength="2"
              required
            />
            <input
              type="text"
              placeholder="Yıl (Son iki hane)"
              value={formData.expireYear}
              onChange={(e) => setFormData({ ...formData, expireYear: e.target.value })}
              maxLength="2"
              required
            />
          </div>
        </div>
        <div className="payment-field">
          <label>CVV:</label>
          <input
            type="text"
            placeholder="CVV"
            value={formData.cvc}
            onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
            maxLength="3"
            required
          />
        </div>
        <div className="payment-amount">
          <label>Ödenecek Tutar: <strong>{formData.amount}₺</strong></label>
        </div>
        <button className="payment-button" type="submit">Ödeme Yap</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default PaymentForm;
