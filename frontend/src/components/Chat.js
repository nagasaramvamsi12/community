import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000'); // Connect to Socket.IO server

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by retrieving userId and email from localStorage
    const storedUserId = localStorage.getItem('userId');
    const storedEmail = localStorage.getItem('email');

    // If no userId or email is found in localStorage, redirect to login
    if (!storedUserId || !storedEmail) {
      navigate('/login');
      return;
    }

    // Set userId and email in state
    setUserId(storedUserId);
    setEmail(storedEmail);

    // Load chat history when component mounts
    socket.emit('request_chat_history');  // Explicitly request chat history from server

    socket.on('load_chat_history', (chatHistory) => {
      console.log('Chat history received from server:', chatHistory); // Log the data
      if (chatHistory && chatHistory.length > 0) {
        setMessages(chatHistory); // Set chat history to state if data exists
      }
    });

    // Listen for new incoming messages in real-time
    socket.on('receive_message', (data) => {
      console.log('New message received:', data);  // Log the new message
      setMessages((prevMessages) => [...prevMessages, data]); // Append new message
    });

    // Cleanup event listeners when component unmounts
    return () => {
      socket.off('load_chat_history');
      socket.off('receive_message');
    };
  }, [navigate]);

  const sendMessage = () => {
    if (message.trim() && userId) {
      const messageData = {
        userId: userId,  // Send the user's id with the message
        message: message
      };

      console.log('Sending message:', messageData); // Log the message being sent
      socket.emit('send_message', messageData); // Send message to the server
      setMessage('');  // Clear input after sending
    }
  };

  const getUserLabel = (id) => {
    return `User${id}`; // Generate User1, User2, etc.
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        Community Chat
      </div>

      <div className="chat-box">
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.userId === userId ? 'outgoing' : 'incoming'}`}>
              <span className="username">{getUserLabel(msg.userId)}</span> {/* Display User1, User2 */}
              <p>{msg.message}</p>
              <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
