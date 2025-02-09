import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import ChatBox from './ChatBox';
import AuthContext from '../contexts/AuthContext'; // Auth context ekleyin

// Socket.IO bağlantısı
const socket = socketIOClient('http://localhost:5002');

const Chat = () => {
  const { user, business } = useContext(AuthContext); // Kullanıcı ve işletme bilgilerini alın
  const [chats, setChats] = useState([]); // Sohbet edilen kullanıcılar
  const [activeChat, setActiveChat] = useState(null); // Aktif sohbet
  const [newMessageNotification, setNewMessageNotification] = useState(false); // Yeni mesaj bildirimi

  // Sohbet edilen kullanıcıları çek
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const endpoint = business
          ? 'http://localhost:5002/api/messages/users-business'
          : 'http://localhost:5002/api/messages/users';

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setChats(response.data);
      } catch (error) {
        console.error('Sohbet kullanıcıları alınamadı:', error);
      }
    };
    fetchChats();
  }, [business]);

  // Yeni mesaj bildirimini almak için Socket.IO dinle
  useEffect(() => {
    socket.on('receiveMessage', () => {
      setNewMessageNotification(true);
    });
    return () => socket.off('receiveMessage');
  }, []);

  const openChat = (chat) => {
    setActiveChat(chat);
    setNewMessageNotification(false); // Bildirimi sıfırla
  };

  return (
    <div>
      {!activeChat ? (
        <div>
          <h3>Sohbetler</h3>
          {newMessageNotification && <p>Yeni mesajınız var!</p>}
          <ul>
            {chats.map((chat) => (
              <li key={chat._id} onClick={() => openChat(chat)} style={{ cursor: 'pointer' }}>
                {chat.role === 'business' ? chat.businessName : chat.fullName}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ChatBox
          receiverId={activeChat._id}
          receiverModel={activeChat.role === 'business' ? 'Business' : 'User'}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default Chat;
