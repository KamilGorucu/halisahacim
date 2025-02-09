import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatBox from './ChatBox';

const ChatNotification = () => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showChatBox, setShowChatBox] = useState(false);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/messages/unread', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUnreadMessages(response.data);
      } catch (error) {
        console.error('Unread messages could not be fetched:', error);
      }
    };

    fetchUnreadMessages();

    const interval = setInterval(fetchUnreadMessages, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleChatOpen = (sender) => {
    setActiveChat(sender);
    setShowChatBox(true);
    markMessagesAsRead(sender._id);
  };

  const markMessagesAsRead = async (chatUserId) => {
    try {
      await axios.post(
        'http://localhost:5002/api/messages/mark-read',
        { chatUserId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUnreadMessages((prev) => prev.filter((msg) => msg.sender._id !== chatUserId));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  return (
    <div style={styles.notificationContainer}>
      {unreadMessages.length > 0 && (
        <div style={styles.badge}>
          {unreadMessages.length}
        </div>
      )}

      <button style={styles.button} onClick={() => setShowChatBox(!showChatBox)}>
        {showChatBox ? 'Kapat' : 'Sohbet'}
      </button>

      {showChatBox && (
        <div style={styles.chatContainer}>
          {activeChat ? (
            <ChatBox
              receiverId={activeChat._id}
              receiverModel={activeChat.role}
              onClose={() => setShowChatBox(false)}
            />
          ) : (
            <div style={styles.messageList}>
              {unreadMessages.map((msg) => (
                <div
                  key={msg._id}
                  style={styles.messageItem}
                  onClick={() => handleChatOpen(msg.sender)}
                >
                  {msg.sender.fullName || msg.sender.businessName}
                </div>
              ))}
              {unreadMessages.length === 0 && <p>No new messages</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  notificationContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
  },
  badge: {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    padding: '5px 10px',
    fontSize: '12px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0078D4',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  chatContainer: {
    width: '300px',
    height: '400px',
    backgroundColor: '#F0F0F0',
    borderRadius: '10px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  messageItem: {
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#FFF',
    borderRadius: '5px',
    cursor: 'pointer',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
};

export default ChatNotification;