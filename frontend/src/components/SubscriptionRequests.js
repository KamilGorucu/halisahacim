import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBox from './ChatBox';
import '../css/SubscriptionRequests.css';

const API_URL = process.env.REACT_APP_API_URL;

const SubscriptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [showChatBox, setShowChatBox] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [receiverModel, setReceiverModel] = useState('User');

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscription/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        setMessage(data.message || 'İstekler alınamadı.');
      }
    } catch (err) {
      console.error('Hata:', err);
      setMessage('Sunucu hatası');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscription/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Abonelik onaylandı.');
        fetchRequests();
      } else {
        setMessage(data.message || 'Onaylanamadı.');
      }
    } catch (err) {
      console.error('Onaylama hatası:', err);
      setMessage('Sunucu hatası');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscription/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Abonelik iptal edildi.');
        fetchRequests();
      } else {
        setMessage(data.message || 'İptal edilemedi.');
      }
    } catch (err) {
      console.error('İptal hatası:', err);
      setMessage('Sunucu hatası');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscription/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Abonelik reddedildi.');
        fetchRequests();
      } else {
        setMessage(data.message || 'Reddedilemedi.');
      }
    } catch (err) {
      console.error('Reddetme hatası:', err);
      setMessage('Sunucu hatası');
    }
  };

  return (
    <div className="subscription-requests-container container mt-4">
      <h4 className="mb-4 text-success">
        <i className="bi bi-calendar-check me-2"></i> Abonelik Talepleri
      </h4>

      {message && (
        <div className="alert alert-info py-2 text-center">{message}</div>
      )}

      {requests.length === 0 ? (
        <p className="text-muted">Gelen abonelik isteği yok.</p>
      ) : (
        <ul className="list-group">
          {requests.map((req) => (
            <li key={req._id} className="list-group-item mb-3 shadow-sm rounded">
              <p className="mb-1">
                <strong>👤 Kullanıcı:</strong> {req.user?.fullName || 'Kullanıcı yok'} ({req.user?.email || 'Email yok'})
              </p>
              <p className="mb-1"><strong>📞 Telefon:</strong> {req.user?.phone || 'Belirtilmemiş'}</p>
              <p className="mb-1"><strong>📅 Gün:</strong> {req.dayOfWeek}</p>
              <p className="mb-1"><strong>🕒 Saat:</strong> {req.timeSlot}</p>
              <p className="mb-2">
                <strong>📌 Durum:</strong>{' '}
                <span className={`badge ${req.status === 'approved' ? 'bg-success' : req.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                  {req.status}
                </span>
              </p>

              <div className="d-flex flex-wrap gap-2">
                {req.status === 'pending' && (
                  <>
                    <button className="btn btn-sm btn-outline-success" onClick={() => handleApprove(req._id)}>
                      ✅ Onayla
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleReject(req._id)}>
                      ❌ Reddet
                    </button>
                  </>
                )}
                {req.status === 'approved' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(req._id)}>
                    ❌ Aboneliği İptal Et
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setReceiverId(req.user._id);
                    setReceiverModel('User');
                    setShowChatBox(true);
                  }}
                >
                  💬 Mesaj Gönder
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showChatBox && (
        <ChatBox
          receiverId={receiverId}
          receiverModel={receiverModel}
          onClose={() => setShowChatBox(false)}
        />
      )}
    </div>
  );
};

export default SubscriptionRequests;
