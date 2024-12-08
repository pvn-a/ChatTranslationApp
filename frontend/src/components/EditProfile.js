import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditProfile = ({ user, setUser }) => {
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:6767/edit-profile', {
        username: user.username,
        password,
        language,
      });
      setUser({ username: response.data.username });
      alert('Profile updated successfully!');
      navigate('/auth');
    } catch (error) {
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="container">
      <h1>Edit Profile</h1>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Preferred Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditProfile;
