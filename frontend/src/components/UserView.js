import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/UserView.css';

const UserView = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
      }
    };
    fetchUser();
  }, [userId]);

  if (!user) return <p className='loading-text'>Kullanıcı bilgileri yükleniyor...</p>;

  return (
    <div className="user-view-container">
      <h2 className="user-name">{user.fullName}</h2>
      <div className="user-details">
        <p><strong>⚽ Oynadığı Takımlar:</strong> {user.teams?.join(', ') || 'Bilinmiyor'}</p>
        <p><strong>📍 Mevki:</strong> {user.position || 'Belirtilmemiş'}</p>
      </div>
    </div>
  );
};

export default UserView;