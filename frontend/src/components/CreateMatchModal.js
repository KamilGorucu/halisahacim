import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CreateMatchModal.css';

const API_URL = process.env.REACT_APP_API_URL;

const CreateMatchModal = ({ requestId, currentUserId, isTeamRequest = false, onClose }) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [lastValidDate, setLastValidDate] = useState('');
  const [hour, setHour] = useState('20:00');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [myLineups, setMyLineups] = useState([]);
  const [opponentLineups, setOpponentLineups] = useState([]);
  const [selectedMyLineup, setSelectedMyLineup] = useState('');
  const [selectedOpponentLineup, setSelectedOpponentLineup] = useState('');
  const [requestType, setRequestType] = useState(null);

  const allHours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0') + ':00'
  );

  const getAvailableHours = () => {
    if (!matchDate) return allHours;

    const today = new Date();
    const selected = new Date(matchDate);

    if (
      today.getFullYear() === selected.getFullYear() &&
      today.getMonth() === selected.getMonth() &&
      today.getDate() === selected.getDate()
    ) {
      // Bugün ise, şu anki saatten küçük saatleri çıkar
      const currentHour = today.getHours();
      return allHours.filter(hour => parseInt(hour.split(':')[0], 10) > currentHour);
    }

    return allHours;
  };

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/messages/chat-list`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setChatUsers(res.data);
      } catch (err) {
        console.error('Sohbet kullanıcıları alınamadı:', err);
      }
    };
    fetchChatUsers();
  }, []);

  useEffect(() => {
    const fetchRequestType = async () => {
      if (!requestId) return;
      try {
        const res = await axios.get(`${API_URL}/api/requests/${requestId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequestType(res.data.type);
      } catch (err) {
        console.error("Talep tipi alınamadı:", err);
      }
    };
    fetchRequestType();
  }, [requestId]);

  const fetchLineupsForMatch = async (opponentId) => {
    try {
      const [myRes, oppRes] = await Promise.all([
        axios.get(`${API_URL}/api/lineups/${currentUserId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get(`${API_URL}/api/lineups/${opponentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      setMyLineups(myRes.data);
      setOpponentLineups(oppRes.data);
    } catch (err) {
      console.error('Kadrolar alınamadı:', err);
    }
  };

  useEffect(() => {
    if (selectedUser && requestType === 'findOpponent') {
      fetchLineupsForMatch(selectedUser);
      setSelectedMyLineup('');
      setSelectedOpponentLineup('');
    }
  }, [selectedUser, requestType]);

  const getEligibleOpponentLineups = () => {
    const myLineup = myLineups.find(l => l._id === selectedMyLineup);
    if (!myLineup) return [];
    return opponentLineups.filter(opp => {
      if (opp.players.length !== myLineup.players.length) return false;
      const myIds = myLineup.players.map(p => p.player._id.toString());
      const oppIds = opp.players.map(p => p.player._id.toString());
      return !myIds.some(id => oppIds.includes(id));
    });
  };

  const handleSubmit = async () => {
    if (!selectedUser || !matchDate || !hour || !location) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    // findOpponent ise kadro zorunlu
    if (requestType === 'findOpponent') {
      if (!selectedMyLineup || !selectedOpponentLineup) {
        alert('Lütfen kadroları seçin.');
        return;
      }
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/matches`, {
        requestId,
        userA: currentUserId,
        userB: selectedUser,
        matchDate,
        hour,
        matchLocation: location,
        myLineupId: requestId ? selectedMyLineup : undefined,
        opponentLineupId: requestId ? selectedOpponentLineup : undefined,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccessMsg('Maç başarıyla oluşturuldu!');
      setTimeout(() => {
        onClose(); // modalı kapat
      }, 1500);
    } catch (err) {
      console.error('Maç oluşturulamadı:', err);
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay d-flex justify-content-center align-items-center">
      <div className="bg-white p-4 rounded shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <h4 className="mb-3 text-success">
          <i className="bi bi-calendar-event me-2"></i>Maç Bilgisi Oluştur
        </h4>

        {/* Kişi Seç */}
        <div className="mb-3">
          <label className="form-label">Kişi Seç:</label>
          <select className="form-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">-- Sohbet edilen kişi seçin --</option>
            {chatUsers
              .filter(user => user.type === 'User')
              .map(user => (
                <option key={user.id || user._id} value={user.id || user._id}>
                  {user.name || user.fullName || user.businessName}
                </option>
              ))}
          </select>
        </div>

        {/* Rakip Bul (findOpponent) türü için lineup seçenekleri */}
        {requestType === 'findOpponent' && (
          <>
            <div className="mb-3">
              <label className="form-label">Kendi Kadron:</label>
              <select className="form-select" value={selectedMyLineup} onChange={(e) => setSelectedMyLineup(e.target.value)}>
                <option value="">Kadro Seçin</option>
                {myLineups.map(lineup => (
                  <option key={lineup._id} value={lineup._id}>{lineup.name}</option>
                ))}
              </select>
            </div>

            {selectedMyLineup && (
              <div className="mb-3">
                <label className="form-label">Rakip Kadro:</label>
                <select className="form-select" value={selectedOpponentLineup} onChange={(e) => setSelectedOpponentLineup(e.target.value)}>
                  <option value="">Rakip Kadro Seçin</option>
                  {getEligibleOpponentLineups().map(lineup => (
                    <option key={lineup._id} value={lineup._id}>{lineup.name}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Tarih */}
        <div className="mb-3">
          <label className="form-label">📅 Tarih:</label>
          <input
            type="date"
            className="form-control"
            value={matchDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              const today = new Date().toISOString().split('T')[0];
              const chosenDate = e.target.value;
              if (chosenDate < today) {
                alert('Geçmiş bir tarih seçemezsiniz.');
                setMatchDate(lastValidDate);
                return;
              }
              setMatchDate(chosenDate);
              setLastValidDate(chosenDate);
              setHour('');
            }}
          />
        </div>

        {/* Saat */}
        <div className="mb-3">
          <label className="form-label">🕗 Başlangıç Saati:</label>
          <select className="form-select" value={hour} onChange={(e) => setHour(e.target.value)}>
            <option value="">Saat Seçin</option>
            {getAvailableHours().map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Lokasyon */}
        <div className="mb-3">
          <label className="form-label">📍 Lokasyon:</label>
          <input
            type="text"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Saha adı, semt..."
          />
        </div>

        {/* Butonlar */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <button className="btn btn-outline-danger" onClick={onClose}>
            <i className="bi bi-x-lg"></i> İptal
          </button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Maçı Oluştur'}
          </button>
        </div>

        {/* Mesaj */}
        {successMsg && <p className="text-success mt-3">{successMsg}</p>}
      </div>
    </div>
  );
};

export default CreateMatchModal;
