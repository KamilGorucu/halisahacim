// PaymentForm.js
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../css/PaymentForm.css';

const API_URL = process.env.REACT_APP_API_URL;

const PaymentForm = () => {
  const { business } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: business?.email || '',
    amount: 1500.00,
    businessId: business?._id || business?.id || '',
  });

  useEffect(() => {
    if (business?.id) {
      setFormData(prev => ({ ...prev, businessId: business.id }));
    }
  }, [business]);

  if (!business || !business.id) {
    return <p className='payment-error'>İşletme bilgileri bulunamadı. Lütfen tekrar giriş yapın.</p>;
  }

// 🛡️ isActive true VE nextPaymentDate gelecek zamandaysa → ödeme sayfasına erişim yok
  const isNextPaymentValid = business.nextPaymentDate && new Date(business.nextPaymentDate) > new Date();
  if (business.isActive || isNextPaymentValid) {
    return <p className="payment-error">Ödeme sayfasına erişim yetkiniz yok. Mevcut aboneliğiniz geçerli.</p>;
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/payments/initialize-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.htmlContent) {
        const newWindow = window.open();
        newWindow.document.open();
        newWindow.document.write(data.htmlContent);
        newWindow.document.close();
      } else {
        alert(data.message || '3D Secure ödeme başlatılamadı.');
      }
    } catch (err) {
      console.error('Hata:', err);
      setErrorMessage('Sunucu hatası oluştu.');
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-success">Ödeme Sayfası</h1>

      <div className="alert alert-info">
        <p><strong>Hizmet Bedeli:</strong> 1500 TL</p>
        <p><strong>İlk Ay Ücretsizdir!</strong></p>
        <p>
          Bu ödeme, <strong>Halısahacım</strong> platformunda işletmenizin listelenmesi, rezervasyon alabilmesi ve kullanıcılarla etkileşim kurabilmesi için yapılmaktadır.
        </p>
      </div>

      <div className="alert alert-warning">
        <strong>⚠️ Önemli:</strong> Ödeme işlemi sırasında sayfayı yenilemeyin veya sekmeyi kapatmayın.
        <br />
        Ödeme tamamlandıktan sonra hesabınızın aktif olması için çıkış yapıp tekrar giriş yapmanız gerekmektedir.
      </div>

      <p>
        📄 <strong>Mesafeli Satış Sözleşmesi:</strong>{' '}
        <a href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noreferrer">
          Sözleşmeyi Görüntüle
        </a>
      </p>

      <form className="mt-4" onSubmit={handlePayment}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Ad Soyad"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="E-posta"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Ödenecek Tutar: <strong>{formData.amount} ₺</strong>
          </label>
        </div>

        <button type="submit" className="btn btn-success w-100">
          💳 {formData.amount} ₺ ile Hizmeti Satın Al
        </button>

        {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default PaymentForm;
