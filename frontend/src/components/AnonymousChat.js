import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AnonymousChat = ({ setUser }) => {
  const [identifier, setIdentifier] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // First, check if a logged-in username exists
    let storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      // User is logged in
      setIdentifier(storedUsername);
      setUser({ username: storedUsername });
    } else {
      // If not logged in, handle guest scenario
      let storedGuestId = sessionStorage.getItem('guestId');
      if (!storedGuestId) {
        storedGuestId = `guest-${Math.random().toString(36).substr(2, 8)}`;
        sessionStorage.setItem('guestId', storedGuestId);
      }
      setIdentifier(storedGuestId);
      setUser({ guest: storedGuestId });
    }
  }, [setUser]);

  const handleCreateChatroom = () => navigate('/create-chatroom');
  const handleJoinChatroom = () => navigate('/join-chatroom');

  return (
    <div>
      <h1>Chat</h1>
      <p>Your ID: {identifier}</p>
      <button onClick={handleCreateChatroom}>Create Chatroom</button>
      <button onClick={handleJoinChatroom}>Join Chatroom</button>
    </div>
  );
};

export default AnonymousChat;
