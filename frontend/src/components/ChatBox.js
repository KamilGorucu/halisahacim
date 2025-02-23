import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import AuthContext from '../contexts/AuthContext';
import '../css/ChatBox.css';

const socket = socketIOClient('http://localhost:5002');

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
          ? `http://localhost:5002/api/messages/history-business/${receiverId}`
          : `http://localhost:5002/api/messages/history/${receiverId}`;
    
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMessages(response.data);

        const markReadEndpoint = isBusiness
          ? 'http://localhost:5002/api/messages/mark-read-business'
          : 'http://localhost:5002/api/messages/mark-read';

        await axios.post(markReadEndpoint, { chatUserId: receiverId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

      } catch (error) {
        console.error('Mesaj geçmişi alınamadı:', error);
      }
    };

    fetchMessages();
  }, [receiverId]);

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
        ? 'http://localhost:5002/api/messages/send-business'
        : 'http://localhost:5002/api/messages/send';

      const response = await axios.post(
        endpoint,
        { receiverId, receiverModel, content: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      socket.emit('sendMessage', response.data.newMessage);
      setMessages((prevMessages) => [...prevMessages, response.data.newMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <h3>Mesajlaşma</h3>
        <button className="chatbox-close" onClick={onClose}>✖</button>
      </div>
      <div className="chatbox-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`chatbox-message ${message.sender === loggedInId ? 'sent' : 'received'}`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className="chatbox-input">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="Mesaj yazın..." 
        />
        <button onClick={sendMessage}>Gönder</button>
      </div>
    </div>
  );
};

export default ChatBox;
