import React, { useContext, useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../App";

const Navbar = ({ user, onLogout }) => {
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user); // Sync with the user prop whenever it changes
  }, [user]);

  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage variables
    setCurrentUser(null); // Clear local user state
    onLogout();
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Typography variant="h6" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          Polyglot
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Switch
            checked={colorMode.mode === "dark"}
            onChange={colorMode.toggleColorMode}
            color="default"
          />
          {currentUser ? (
            <>
              <Typography variant="body1">{`Hello, ${currentUser.username}`}</Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
