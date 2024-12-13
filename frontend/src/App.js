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
import ChatScreen from "./components/ChatScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Import Footer
import { WebSocketProvider } from "./components/WebSocket";
import NotificationComponent from "./components/Notification";

export const ColorModeContext = React.createContext();

function App() {
  const [user, setUser] = useState(() => {
    const storedUsername = sessionStorage.getItem("username");
    return storedUsername ? { username: storedUsername } : null;
  });
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
    sessionStorage.clear();
    setUser(null);
  };

  return (
    // <WebSocketProvider>
    //   <NotificationComponent />
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Navbar user={user} onLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/anonymous" element={<AnonymousChat setUser={setUser} />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/chat/:receiverUsername" element={<ChatScreen />} />
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
            <Footer /> {/* Add Footer here */}
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>
//    </WebSocketProvider>
  );
}

export default App;
