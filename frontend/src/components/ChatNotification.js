import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ChatBox from './ChatBox';
import AuthContext from '../contexts/AuthContext';
import '../css/ChatNotification.css';
const API_URL = process.env.REACT_APP_API_URL;
const ChatNotification = () => {
  const { user, business } = useContext(AuthContext);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [activeChat, setActiveChat] = useState(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const isBusiness = !!business;

  // 📥 Okunmamış mesajları getir
  const fetchUnreadMessages = async () => {
    try {
      const endpoint = isBusiness
        ? `${API_URL}/messages/unread-business`
        : `${API_URL}/messages/unread`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Toplam okunmamış mesaj sayısını hesapla
      const unreadCounts = {};
      response.data.forEach((msg) => {
        const senderId = msg.sender._id;
        unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
      });

      setUnreadMessages(unreadCounts);
      setTotalUnread(response.data.length);
    } catch (error) {
      console.error('Okunmamış mesajlar alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000); // Her 30 saniyede kontrol et
    return () => clearInterval(interval);
  }, []);

  // ✅ Okundu olarak işaretle
  const markMessagesAsRead = async (chatUserId) => {
    try {
      const endpoint = isBusiness
        ? `${API_URL}/messages/mark-read-business`
        : `${API_URL}/messages/mark-read`;

      await axios.post(
        endpoint,
        { chatUserId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[chatUserId]; // Okunduğu için kaldır
        return updated;
      });
      setTotalUnread((prev) => Math.max(0, prev - (unreadMessages[chatUserId] || 0)));
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenemedi:', error);
    }
  };

  const handleChatOpen = (chat) => {
    setActiveChat(chat);
    setShowChatBox(true);
    markMessagesAsRead(chat._id);
  };

  return (
    <div className="chat-notification">
      {/* 🔴 Sohbet sekmesi bildirim */}
      <div className="nav-chat">
        <span>Sohbet</span>
        {totalUnread > 0 && <span className="unread-badge">{totalUnread}</span>}
      </div>

      {/* 📩 Sohbet Listesi */}
      {showChatBox ? (
        <ChatBox
          receiverId={activeChat._id}
          receiverModel={activeChat.role}
          onClose={() => setShowChatBox(false)}
        />
      ) : (
        <div className="chat-list">
          {Object.keys(unreadMessages).length > 0 ? (
            Object.entries(unreadMessages).map(([chatId, count]) => (
              <div key={chatId} className="chat-item" onClick={() => handleChatOpen({ _id: chatId, role: 'User' })}>
                <span className="chat-name">Sohbet {chatId}</span>
                <span className="unread-badge">{count}</span>
              </div>
            ))
          ) : (
            <p>Okunmamış mesaj yok.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatNotification;
