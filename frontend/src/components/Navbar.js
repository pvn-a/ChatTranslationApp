import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../App";

const Navbar = ({ user, onLogout }) => {
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar style={{ justifyContent: "space-between" }}>
        {/* App Title or Logo */}
        <Typography variant="h6" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          Polyglot
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Dark Mode Toggle */}
          <Switch
            checked={colorMode.mode === "dark"}
            onChange={colorMode.toggleColorMode}
            color="default"
          />
          {/* <Typography variant="body1">{colorMode.mode === "dark" ? "Dark" : "Light"} Mode</Typography> */}

          {/* User Info or Login/Logout */}
          {user ? (
            <>
              <Typography variant="body1">{`Hello, ${user.username || user.guest}`}</Typography>
              <Button color="inherit" onClick={onLogout}>
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
