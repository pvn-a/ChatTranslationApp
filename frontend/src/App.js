import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import LandingPage from "./components/LandingPage";
import AuthChat from "./components/AuthChat";
import AnonymousChat from "./components/AnonymousChat";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import CreateChatroom from "./components/CreateChatroom";
import JoinChatroom from "./components/JoinChatroom";
import EditProfile from "./components/EditProfile";
import PrivateRoute from "./components/PrivateRoute";
import ChatList from "./components/ChatList";
// import ChatInterface from "./components/ChatInterface";
import Navbar from "./components/Navbar";

export const ColorModeContext = React.createContext();

function App() {
  const [user, setUser] = useState(null); // Stores the user state
  const [mode, setMode] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((prevMode) => (prevMode === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const handleLogout = () => {
    // Clear session and reset user state
    sessionStorage.removeItem("username");
    setUser(null);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {/* Common Navbar for all screens */}
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/anonymous" element={<AnonymousChat setUser={setUser} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<SignUp />} />
            {/* <Route path="/chat/:chatId" element={<ChatInterface />} /> */}
            <Route path="/chats" element={<ChatList />} />
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
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
