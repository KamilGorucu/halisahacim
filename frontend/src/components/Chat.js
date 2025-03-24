import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import { Link } from 'react-router-dom';
import ChatBox from './ChatBox';
import AuthContext from '../contexts/AuthContext';
import '../css/Chat.css';
const API_URL = process.env.REACT_APP_API_URL;
const socket = socketIOClient(`${API_URL}`);

const Chat = () => {
  const { user, business } = useContext(AuthContext);
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
          ? `${API_URL}/messages/chat-list-business`
          : `${API_URL}/messages/chat-list`;

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
          ? `${API_URL}/messages/unread-business`
          : `${API_URL}/messages/unread`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        let unreadMap = {};
        let total = 0;

        response.data.forEach((msg) => {
          const senderId = msg.sender._id;
          unreadMap[senderId] = (unreadMap[senderId] || 0) + 1;
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

  // 🔹 Sohbet açıldığında okunmamış mesajları temizle
  const openChat = async (chat) => {
    setActiveChat(chat);

    try {
      const endpoint = isBusiness
        ? `${API_URL}/messages/mark-read-business`
        : `${API_URL}/messages/mark-read`;

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
    <div className="chat-container">
      <h3 className="chat-title">
        Sohbetler {totalUnread > 0 && <span className="unread-badge">{totalUnread}</span>}
      </h3>
      <ul className="chat-list">
        {chatList.map((chat) => (
          <li key={chat.id} className="chat-item">
            <Link to={`/user/${chat.id}`} className="chat-link">{chat.name}</Link>
            {unreadCounts[chat.id] > 0 && <span className="unread-badge">{unreadCounts[chat.id]}</span>}
            <button className="chat-button" onClick={() => openChat(chat)}>Mesajlaş</button>
          </li>
        ))}
      </ul>
      {activeChat && <ChatBox receiverId={activeChat.id} receiverModel={activeChat.type} onClose={() => setActiveChat(null)} />}
    </div>
  );
};

export default Chat;
