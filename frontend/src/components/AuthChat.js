import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthChat = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Authenticated Chat</h1>
      <button onClick={() => navigate('/create-chatroom')}>Create Chatroom</button>
      <button onClick={() => navigate('/join-chatroom')}>Join Chatroom</button>
    </div>
  );
};

export default AuthChat;
