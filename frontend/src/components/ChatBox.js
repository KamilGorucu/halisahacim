import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import AuthContext from '../contexts/AuthContext';

const socket = socketIOClient('http://localhost:5002');

const ChatBox = ({ receiverId, receiverModel, onClose }) => {
  const { user, business } = useContext(AuthContext); // Kullanıcı ve işletme bilgilerini al
  const loggedInId = user?.id || business?.id; // Giriş yapan kişinin ID'si
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const endpoint = business
          ? `http://localhost:5002/api/messages/history-business/${receiverId}`
          : `http://localhost:5002/api/messages/history/${receiverId}`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setMessages(response.data);
      } catch (error) {
        console.error('Mesaj geçmişi alınamadı:', error);
      }
    };

    fetchMessages();
  }, [receiverId, business]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      if (message.receiver === receiverId || message.sender === receiverId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => socket.off('receiveMessage');
  }, [receiverId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const endpoint = business
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
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onClose} style={styles.closeButton}>
          Geri
        </button>
        <h3>Mesajlaşma</h3>
      </div>
      <div style={styles.messageContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: message.sender === loggedInId ? 'flex-end' : 'flex-start',
              backgroundColor: message.sender === loggedInId ? '#d1ffc4' : '#e0e0e0',
            }}
          >
            {message.content}
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesaj yazın..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendButton}>
          Gönder
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
  },
  closeButton: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
  },
  messageContainer: {
    flex: 1,
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    backgroundColor: '#fff',
  },
  message: {
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '70%',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginRight: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#0078D4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default ChatBox;
