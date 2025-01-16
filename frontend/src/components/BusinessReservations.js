import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BusinessReservation = ({ businessId }) => {
  const [requests, setRequests] = useState([]);

  // İlk yüklendiğinde rezervasyon isteklerini getir
  useEffect(() => {
    fetchRequests();
  }, []);

  // Rezervasyon isteklerini çekme fonksiyonu
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`/api/reservation-requests?businessId=${businessId}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Rezervasyon istekleri alınırken hata oluştu:', error);
    }
  };

  // Rezervasyonu onaylama fonksiyonu
  const approveRequest = async (id) => {
    try {
      await axios.post('/api/approve-reservation', { reservationId: id });
      fetchRequests(); // Onay sonrası istekleri güncelle
    } catch (error) {
      console.error('Rezervasyon onaylanırken hata oluştu:', error);
    }
  };

  // Rezervasyonu reddetme fonksiyonu (isteğe bağlı)
  const rejectRequest = async (id) => {
    try {
      await axios.post('/api/reject-reservation', { reservationId: id });
      fetchRequests(); // Reddetme sonrası istekleri güncelle
    } catch (error) {
      console.error('Rezervasyon reddedilirken hata oluştu:', error);
    }
  };

  return (
    <div>
      <h1>Rezervasyon İstekleri</h1>
      <ul>
        {requests.length === 0 ? (
          <p>Hiç rezervasyon isteği yok.</p>
        ) : (
          requests.map((req) => (
            <li key={req._id}>
              <p>
                <strong>Tarih:</strong> {req.date} - <strong>Saat:</strong> {req.timeSlot}
              </p>
              <div>
                <button onClick={() => approveRequest(req._id)}>Onayla</button>
                <button onClick={() => rejectRequest(req._id)} style={{ marginLeft: '10px' }}>
                  Reddet
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default BusinessReservation;
