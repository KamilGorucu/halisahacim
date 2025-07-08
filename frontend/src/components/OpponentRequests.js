import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ChatBox from './ChatBox';
import CitySelector from './CitySelector';
import FifaCard from './FifaCard';
import CreateMatchModal from './CreateMatchModal';
import AuthContext from '../contexts/AuthContext';
// import '../css/OpponentRequests.css';

const API_URL = process.env.REACT_APP_API_URL;

const OpponentRequests = () => {
  const { user } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTeamSize, setSelectedTeamSize] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get(`${API_URL}/api/requests`, {
          params: { type: 'findOpponent', city: selectedCity, teamSize: selectedTeamSize },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Rakip bulma talepleri alınamadı:', error);
      }
    };

    fetchRequests();
  }, [selectedCity, selectedTeamSize]);

  const openMatchModal = (req) => {
    setSelectedRequest(req);
    setShowMatchModal(true);
  };
  

  return (
    <div className="container my-4 opponent-container">
      <h2 className="text-success text-center mb-3">
        <i className="bi bi-people-fill me-2"></i>Rakip Arayanlar
      </h2>
      <p className="text-center text-muted mb-4">7 günü geçmiş istekler otomatik olarak silinir.</p>

      <CitySelector selectedCity={selectedCity} setSelectedCity={setSelectedCity} />

      <div className="mb-3 text-center">
        <label className="form-label fw-bold me-2">Takım Boyutu:</label>
        <select
          value={selectedTeamSize}
          onChange={(e) => setSelectedTeamSize(e.target.value)}
          className="form-select d-inline-block w-auto"
        >
          <option value="">Tümü</option>
          {[5, 6, 7, 8, 9, 10, 11].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
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
                      <strong>⚽ Takım Boyutu:</strong> {req.teamSize}
                    </p>
                    <p className="mb-1">
                      <strong>📝 Açıklama:</strong> {req.description || 'Belirtilmemiş'}
                    </p>
                    <p className="mb-2">
                      <strong>👤 Kullanıcı:</strong>{' '}
                      <Link to={`/user/${req.user._id}`} className="text-decoration-none text-success">
                        {req.user.fullName}
                      </Link>
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => setActiveChat({ id: req.user._id, model: 'User' })}
                      >
                        <i className="bi bi-chat-dots-fill me-1"></i>Mesajlaş
                      </button>
                      {req.user._id === user?.id && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openMatchModal(req)}
                        >
                          <i className="bi bi-check-circle-fill me-1"></i>Rakip Bulundu
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
          <p className="text-center text-muted mt-4">Bu şehirde henüz rakip bulma talebi yok.</p>
        ) : (
          <p className="text-center text-muted mt-4">Lütfen bir şehir seçin.</p>
        )}
      </ul>

      {/* Chat */}
      {activeChat && (
        <ChatBox
          receiverId={activeChat.id}
          receiverModel={activeChat.model}
          onClose={() => setActiveChat(null)}
        />
      )}

      {/* Modal */}
      {showMatchModal && selectedRequest && (
        <CreateMatchModal
          requestId={selectedRequest._id}
          currentUserId={user.id}
          isTeamRequest={true}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default OpponentRequests;
