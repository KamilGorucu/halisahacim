import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ChatBox from './ChatBox';
import CitySelector from './CitySelector';
import FifaCard from './FifaCard';
import CreateMatchModal from './CreateMatchModal';
import AuthContext from '../contexts/AuthContext';
import '../css/PlayerRequests.css';

const API_URL = process.env.REACT_APP_API_URL;

const PlayerRequests = () => {
  const { user } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get(`${API_URL}/api/requests`, {
          params: { type: 'findPlayer', city: selectedCity, positionNeeded: selectedPosition, },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Oyuncu bulma talepleri alınamadı:', error);
      }
    };

    fetchRequests();
  }, [selectedCity, selectedPosition]);

  const openMatchModal = (req) => {
    setSelectedRequest(req);
    setShowMatchModal(true);
  };
  
  return (
    <div className="container my-4">
      <h4 className="text-success text-center fw-bold mb-3">
        <i className="bi bi-person-bounding-box me-2"></i>Oyuncu Arayanlar
      </h4>
      <p className="text-center text-muted mb-4">7 günü geçmiş istekler otomatik olarak silinir.</p>

      <CitySelector selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

      <div className="my-3">
        <label className="form-label fw-semibold">
          <i className="bi bi-filter-circle me-1"></i>Pozisyon Filtrele:
        </label>
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="form-select w-auto d-inline-block ms-2"
        >
          <option value="">Tümü</option>
          <option value="Kaleci">Kaleci</option>
          <option value="Stoper">Stoper</option>
          <option value="Bek">Bek</option>
          <option value="Orta Saha">Orta Saha</option>
          <option value="Ofansif Orta Saha">Ofansif Orta Saha</option>
          <option value="Kanat">Kanat</option>
          <option value="Forvet">Forvet</option>
        </select>
      </div>

      <div className="row">
        {selectedCity && requests.length > 0 ? (
          requests.map((req) => (
            <div key={req._id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-md-row justify-content-between align-items-start">
                  {/* Sol içerik */}
                  <div className="me-3" style={{ flex: 1 }}>
                    <p className="mb-1">
                      <i className="bi bi-person-fill-gear me-2"></i><strong>Aranan Mevki:</strong> {req.positionNeeded || 'Belirtilmemiş'}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-card-text me-2"></i><strong>Açıklama:</strong> {req.description || 'Belirtilmemiş'}
                    </p>
                    <p className="mb-2">
                      <i className="bi bi-person-circle me-2"></i><strong>Kullanıcı:</strong>{' '}
                      {req.user ? (
                        <Link to={`/user/${req.user._id}`} className="text-decoration-underline">
                          {req.user.fullName}
                        </Link>
                      ) : (
                        <span className="text-muted">Silinmiş Kullanıcı</span>
                      )}
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      {req.user && (
                        <>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => setActiveChat({ id: req.user._id, model: 'User' })}
                          >
                            <i className="bi bi-chat-dots-fill me-1"></i>Mesajlaş
                          </button>
                          {req.user._id === user?.id && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openMatchModal(req)}
                            >
                              <i className="bi bi-person-check-fill me-1"></i>Oyuncu Bulundu
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sağ kart (her zaman solun yanında kalsın) */}
                  <div className="d-flex align-items-start" style={{ minWidth: 150 }}>
                    {req.user ? (
                      <FifaCard
                        user={{
                          ...req.user,
                          fifaStats: req.user.fifaStats || {},
                          imageUrl: req.user.photo
                            ? `${API_URL}/${req.user.photo.startsWith('uploads/') ? req.user.photo : 'uploads/' + req.user.photo}`
                            : undefined,
                        }}
                      />
                    ) : (
                      <div className="text-muted small text-center mt-2">Fifa kartı gösterilemiyor</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : selectedCity ? (
          <p className="text-muted mt-3">Bu şehirde henüz oyuncu bulma talebi yok.</p>
        ) : (
          <p className="text-muted mt-3">Lütfen bir şehir seçin.</p>
        )}
      </div>

      {activeChat && (
        <ChatBox
          receiverId={activeChat.id}
          receiverModel={activeChat.model}
          onClose={() => setActiveChat(null)}
        />
      )}

      {showMatchModal && selectedRequest && (
        <CreateMatchModal
          requestId={selectedRequest._id}
          currentUserId={user.id}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default PlayerRequests;
