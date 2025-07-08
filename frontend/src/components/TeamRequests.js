import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import CitySelector from './CitySelector';
import ChatBox from './ChatBox';
import FifaCard from './FifaCard';
import CreateMatchModal from './CreateMatchModal';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../css/TeamRequests.css';

const API_URL = process.env.REACT_APP_API_URL;

const TeamRequests = () => {
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
          params: { type: 'findTeam', city: selectedCity, position: selectedPosition, },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Takım bulma talepleri alınamadı:', error);
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
        <i className="bi bi-people-fill me-2"></i>Takım Arayanlar
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

      <ul className="list-unstyled">
        {selectedCity && requests.length > 0 ? (
          requests.map((req) => (
            <li key={req._id} className="mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-md-row justify-content-between align-items-start">
                  {/* Sol içerik */}
                  <div className="me-3" style={{ flex: 1 }}>
                    <p className="mb-1">
                      <i className="bi bi-person-fill me-2"></i>
                      <strong>Oynadığı Mevki:</strong> {req.position || 'Belirtilmemiş'}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-card-text me-2"></i>
                      <strong>Açıklama:</strong> {req.description || 'Belirtilmemiş'}
                    </p>
                    <p className="mb-2">
                      <i className="bi bi-person-circle me-2"></i>
                      <strong>Kullanıcı:</strong>{' '}
                      <Link to={`/user/${req.user._id}`} className="text-decoration-underline text-success">
                        {req.user.fullName}
                      </Link>
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => setActiveChat({ id: req.user._id, model: 'User' })}
                      >
                        <i className="bi bi-chat-left-text-fill me-1"></i>Mesajlaş
                      </button>
                      {req.user._id === user?.id && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => openMatchModal(req)}
                        >
                          <i className="bi bi-check-circle-fill me-1"></i>Takım Bulundu
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sağdaki sabit kart */}
                  <div className="d-flex align-items-start" style={{ minWidth: 150 }}>
                    <FifaCard
                      user={{
                        ...req.user,
                        fifaStats: req.user.fifaStats || {},
                        imageUrl: req.user.photo
                          ? `${API_URL}/${req.user.photo.startsWith('uploads/') ? req.user.photo : 'uploads/' + req.user.photo}`
                          : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : selectedCity ? (
          <p className="text-muted mt-3">Bu şehirde henüz takım arayan yok.</p>
        ) : (
          <p className="text-muted mt-3">Lütfen bir şehir seçin.</p>
        )}
      </ul>

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

export default TeamRequests;
