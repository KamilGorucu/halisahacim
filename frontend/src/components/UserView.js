import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import FifaCard from './FifaCard';
import AuthContext from '../contexts/AuthContext';
import '../css/UserView.css';

const API_URL = process.env.REACT_APP_API_URL;

const UserView = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [friendStatus, setFriendStatus] = useState('none'); // '', 'pending', 'accepted'

  useEffect(() => {
    fetchUser();
    if (user) {
      checkFriendStatus();
    }
  }, [userId, user]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUserInfo(data);
      }
    } catch (err) {
      console.error('Kullanıcı bilgisi alınamadı:', err);
    }
  };

  const checkFriendStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/friends/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setFriendStatus(data.status);
      }
    } catch (err) {
      console.error('Arkadaşlık durumu kontrolü hatası:', err);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/friends/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Arkadaşlık isteği gönderildi!');
        setFriendStatus('pending');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Arkadaşlık isteği hatası:', err);
    }
  };

  if (!userInfo) return <p className='loading-text'>Kullanıcı bilgileri yükleniyor...</p>;

  return (
    <div className="container my-4">
      <h3 className="text-center text-success mb-4">
        <i className="bi bi-person-circle me-2"></i>{userInfo.fullName}
      </h3>

      <div className="row align-items-center">
        {/* Sol Kısım: Bilgiler */}
        <div className="col-md-6 mb-4">
          <ul className="list-group">
            <li className="list-group-item">
              <strong>⚽ Oynadığı Takımlar:</strong> {userInfo.teams?.join(', ') || 'Bilinmiyor'}
            </li>
            <li className="list-group-item">
              <strong>📍 Mevki:</strong> {userInfo.position || 'Belirtilmemiş'}
            </li>
            {user?.id !== userId && (
              <li className="list-group-item">
                {friendStatus === 'none' && (
                  <button className="btn btn-outline-success w-100" onClick={sendFriendRequest}>
                    ➕ Arkadaş Ekle
                  </button>
                )}
                {friendStatus === 'pending' && (
                  <p className="text-warning fw-bold text-center mb-0">İstek Gönderildi</p>
                )}
                {friendStatus === 'accepted' && (
                  <p className="text-success fw-bold text-center mb-0">Zaten Arkadaşsınız</p>
                )}
              </li>
            )}
          </ul>
        </div>

        {/* Sağ Kısım: FIFA Kartı */}
        <div className="col-md-6 d-flex justify-content-center">
          <div className="shadow-sm rounded">
            <FifaCard
              user={{
                ...userInfo,
                imageUrl: userInfo.photo
                  ? `${API_URL}/${userInfo.photo.startsWith('uploads/') ? userInfo.photo : 'uploads/' + userInfo.photo}`
                  : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
