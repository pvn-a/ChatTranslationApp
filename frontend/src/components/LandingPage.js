import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Chat Application</h1>
      <p>Your logo here</p>
      <div className="button-container">
        <button onClick={() => navigate('/auth')}>Auth Chat</button>
        <button onClick={() => navigate('/anonymous')}>Anonymous Chat</button>
      </div>
    </div>
  );
};

export default LandingPage;
