import React, { useContext, useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Switch, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../App";

const Navbar = ({ user, onLogout }) => {
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    setAnchorEl(null);
    navigate("/edit-profile");
  };

  const handleLogout = () => {
    setAnchorEl(null);
    sessionStorage.clear();
    setCurrentUser(null);
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
          {/* <Switch
            checked={colorMode.mode === "dark"}
            onChange={colorMode.toggleColorMode}
            color="default"
          /> */}
          {currentUser ? (
            <>
              <Typography variant="body1">{`Hello, ${currentUser.username}`}</Typography>
              <Button color="inherit" onClick={handleMenuClick}>
                Profile
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate("/login")}>Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
