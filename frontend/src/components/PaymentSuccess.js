import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/PaymentSuccess.css'; // Eğer özel stilin varsa

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 5 saniye sonra profil sayfasına yönlendir
    const timer = setTimeout(() => {
      navigate('/profile/business');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center text-center py-5">
      <div className="alert alert-success w-100 max-w-600">
        <h1 className="display-5">✅ Ödeme Başarılı!</h1>
        <p className="mt-3">
          Artık işletmeniz aktif! 5 saniye içinde <strong>profil sayfanıza</strong> yönlendirileceksiniz.
        </p>
        <p>
          Eğer yönlendirilmezseniz{' '}
          <a href="/profile/business" className="alert-link">
            buraya tıklayın
          </a>.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
