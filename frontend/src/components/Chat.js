import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import ChatBox from './ChatBox';
import AuthContext from '../contexts/AuthContext';
import '../css/Chat.css';
const API_URL = process.env.REACT_APP_API_URL;
const socket = socketIOClient(`${API_URL}`);

const Chat = () => {
  const { user, business } = useContext(AuthContext);
  const location = useLocation();
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);

  const isBusiness = !!business;

  // 🔹 Sohbet listesini getir
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const endpoint = isBusiness
          ? `${API_URL}/api/messages/chat-list-business`
          : `${API_URL}/api/messages/chat-list`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setChatList(response.data);
      } catch (error) {
        console.error('Sohbet kullanıcıları alınamadı:', error);
      }
    };

    if (user || business) fetchChats();
  }, [user, business]);

  // 🔹 Okunmamış mesaj sayılarını al
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const endpoint = isBusiness
          ? `${API_URL}/api/messages/unread-business`
          : `${API_URL}/api/messages/unread`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        let unreadMap = {};
        let total = 0;

        response.data.forEach((msg) => {
          const chatId = msg.chatId; // artık doğrudan geliyor
          unreadMap[chatId] = (unreadMap[chatId] || 0) + 1;
          total += 1;
        });

        setUnreadCounts(unreadMap);
        setTotalUnread(total);
      } catch (error) {
        console.error('Okunmamış mesajlar alınamadı:', error);
      }
    };

    fetchUnreadCounts();
  }, [user, business]);

  useEffect(() => {
    socket.on('receiveMessage', () => {
      setTotalUnread((prev) => prev + 1);
    });
    return () => socket.off('receiveMessage');
  }, []);

  // 🔹 URL'den gelen receiverId ve receiverModel varsa sohbeti otomatik aç
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const receiverId = params.get('receiverId');
    const receiverModel = params.get('receiverModel');

    if (receiverId && receiverModel) {
      setActiveChat({ id: receiverId, type: receiverModel });
    }
  }, [location.search]);

  // 🔹 Sohbet açıldığında okunmamış mesajları temizle
  const openChat = async (chat) => {
    setActiveChat(chat);

    try {
      const endpoint = isBusiness
        ? `${API_URL}/api/messages/mark-read-business`
        : `${API_URL}/api/messages/mark-read`;

      await axios.post(endpoint, { chatUserId: chat.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setTotalUnread((prev) => Math.max(0, prev - (unreadCounts[chat.id] || 0)));
      setUnreadCounts((prev) => ({ ...prev, [chat.id]: 0 }));
    } catch (error) {
      console.error('Mesajları okundu olarak işaretleme hatası:', error);
    }
  };

  return (
    <div className="container my-4">
      <h4 className="d-flex align-items-center justify-content-between text-success">
        <i className="bi bi-chat-dots-fill me-2"></i>Sohbetler
        {totalUnread > 0 && (
          <span className="badge bg-danger rounded-pill">{totalUnread}</span>
        )}
      </h4>

      <ul className="list-group mt-3">
        {chatList.map((chat) => (
          <li key={chat.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong className="text-dark">{chat.name}</strong>
              {Number(unreadCounts[chat.id] || 0) > 0 && (
                <span className="badge bg-warning text-dark ms-2">
                  {unreadCounts[chat.id]}
                </span>
              )}
            </div>
            <button className="btn btn-outline-success btn-sm rounded-pill" onClick={() => openChat(chat)}>
              <i className="bi bi-envelope-open me-1"></i>Mesajlaş
            </button>
          </li>
        ))}
      </ul>

      {activeChat && (
        <div className="mt-4">
          <ChatBox
            receiverId={activeChat.id}
            receiverModel={activeChat.type}
            onClose={() => setActiveChat(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Chat;
