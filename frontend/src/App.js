import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthChat from './components/AuthChat';
import AnonymousChat from './components/AnonymousChat';
import Login from './components/Login';
import SignUp from './components/SignUp';
import CreateChatroom from './components/CreateChatroom';
import JoinChatroom from './components/JoinChatroom';
import EditProfile from './components/EditProfile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div>
        {user && <div className="header">Logged in as: {user.username || user.guest}</div>}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/anonymous" element={<AnonymousChat setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/auth"
            element={
              <PrivateRoute user={user}>
                <AuthChat user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
          <Route path="/create-chatroom" element={<CreateChatroom />} />
          <Route path="/join-chatroom" element={<JoinChatroom />} />
          <Route
            path="/edit-profile"
            element={
              <PrivateRoute user={user}>
                <EditProfile user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
