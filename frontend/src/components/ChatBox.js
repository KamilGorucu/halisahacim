import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import AuthContext from '../contexts/AuthContext';
import '../css/ChatBox.css';

const API_URL = process.env.REACT_APP_API_URL;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
const socket = socketIOClient(SOCKET_URL);

const ChatBox = ({ receiverId, receiverModel, onClose }) => {
  const { user, business } = useContext(AuthContext);
  const loggedInId = user?.id || business?.id;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const isBusiness = !!business;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const endpoint = isBusiness
          ? `${API_URL}/api/messages/history-business/${receiverId}`
          : `${API_URL}/api/messages/history/${receiverId}`;
    
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMessages(response.data);

        const markReadEndpoint = isBusiness
          ? `${API_URL}/api/messages/mark-read-business`
          : `${API_URL}/api/messages/mark-read`;

        await axios.post(markReadEndpoint, { chatUserId: receiverId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

      } catch (error) {
        console.error('Mesaj geçmişi alınamadı:', error);
      }
    };

    fetchMessages();
  }, [receiverId]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log('Anlık gelen mesaj:', message);
      // sadece bu aktif sohbetle ilgiliyse ekle
      const isForThisChat =
        (message.sender === receiverId && message.receiver === loggedInId) ||
        (message.sender === loggedInId && message.receiver === receiverId);

      if (isForThisChat) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [receiverId, loggedInId]);

  useEffect(() => {
    const loggedInUserId = user?.id || business?.id;
    if (loggedInUserId) {
      socket.emit('join', { userId: loggedInUserId });
    }
  }, [user, business]);

  // ENTER tuşuna basıldığında mesaj gönderme
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Sayfanın refresh olmasını engeller
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const endpoint = isBusiness
        ? `${API_URL}/api/messages/send-business`
        : `${API_URL}/api/messages/send`;

      const response = await axios.post(
        endpoint,
        { receiverId, receiverModel, content: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      socket.emit('sendMessage', {
        senderId: loggedInId,
        receiverId,
        content: newMessage
      });
      setMessages((prevMessages) => [...prevMessages, response.data.newMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  };

  return (
    <div className="container border rounded shadow-sm p-3 bg-white mt-3">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
      <h5 className="mb-0 text-success">
        <i className="bi bi-chat-text me-2"></i>Mesajlaşma
      </h5>
      <button className="btn btn-sm btn-outline-danger" onClick={onClose}>
        <i className="bi bi-x-lg"></i>
      </button>
    </div>

    {/* Messages */}
    <div className="chatbox-messages overflow-auto mb-3 bg-warning-subtle" style={{ maxHeight: '300px' }}>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`d-flex mb-2 ${message.sender === loggedInId ? 'justify-content-end' : 'justify-content-start'}`}
        >
          <div className={`p-2 rounded ${message.sender === loggedInId ? 'bg-success text-white' : 'bg-light text-dark'}`}>
            {message.content}
          </div>
        </div>
      ))}
    </div>

    {/* Input */}
    <div className="d-flex">
      <input
        type="text"
        className="form-control me-2"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Mesaj yazın..."
      />
      <button className="btn btn-success" onClick={sendMessage}>
        <i className="bi bi-send-fill"></i>
      </button>
    </div>
  </div>
  );
};

export default ChatBox;
