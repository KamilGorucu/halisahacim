import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FriendSearch from './FriendSearch';
import FifaCard from './FifaCard';
import '../css/FriendList.css'; // İstersen bir CSS de ayarlarız

const API_URL = process.env.REACT_APP_API_URL;

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?._id) setCurrentUserId(storedUser._id);

    fetchFriends();
    fetchPendingRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/friends/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Arkadaşlar alınamadı:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/friends/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Bekleyen istekler alınamadı:', error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const response = await axios.post(`${API_URL}/api/friends/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 200) {
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('İstek kabul edilirken hata:', error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const response = await axios.post(`${API_URL}/api/friends/reject/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 200) {
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('İstek reddedilirken hata:', error);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Arkadaşlarım</h2>

      {friends.length === 0 ? (
        <p className="text-center text-muted">Henüz arkadaşınız yok.</p>
      ) : (
        <div className="row g-4">
          {friends.map((friend) => (
            <div key={friend._id} className="col-md-2">
              <div className="card h-100 text-center justify-content-center align-items-center shadow">
                <div className="card-body justify-content-center align-items-center">
                  <h5 className="card-title">{friend.otherUser.fullName}</h5>
                  <FifaCard
                    user={{
                      ...friend.otherUser,
                      imageUrl: friend.otherUser.photo
                        ? `${API_URL}/${friend.otherUser.photo.startsWith('uploads/') ? friend.otherUser.photo : 'uploads/' + friend.otherUser.photo}`
                        : undefined,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-center my-5">Bekleyen İstekler</h2>

      {pendingRequests.length === 0 ? (
        <p className="text-center text-muted">Bekleyen arkadaşlık isteğiniz yok.</p>
      ) : (
        <div className="row g-4">
          {pendingRequests.map((request) => (
            <div key={request._id} className="col-md-2">
              <div className="card h-100 text-center justify-content-center align-items-center shadow">
                <div className="card-body">
                  <h5 className="card-title">{request.sender.fullName}</h5>
                  <FifaCard
                    user={{
                      ...request.sender,
                      imageUrl: request.sender.photo
                        ? `${API_URL}/${request.sender.photo.startsWith('uploads/') ? request.sender.photo : 'uploads/' + request.sender.photo}`
                        : undefined,
                    }}
                  />
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <button onClick={() => acceptRequest(request._id)} className="btn btn-success btn-sm rounded-pill">
                      ✅ Kabul Et
                    </button>
                    <button onClick={() => rejectRequest(request._id)} className="btn btn-danger btn-sm rounded-pill">
                      ❌ Reddet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-center my-5">Yeni Arkadaş Ekle</h2>
      <FriendSearch />
    </div>
  );
};

export default FriendList;
