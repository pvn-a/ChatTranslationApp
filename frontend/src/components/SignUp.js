import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  MenuItem,
} from "@mui/material";
import config from "./config";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const response = await fetch(`${config.apiUrl}/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        language_preference: language,
      }),
    });

    if (response.ok) {
      alert("Account created successfully!");
      navigate("/");
    } else {
      alert("Sign up failed. Try again.");
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Email Address"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Language Preference"
          select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="fr">French</MenuItem>
          <MenuItem value="es">Spanish</MenuItem>
          <MenuItem value="de">German</MenuItem>
        </TextField>
        <Button variant="contained" color="primary" onClick={handleSignUp}>
          Sign Up
        </Button>
      </Box>
    </Container>
  );
}

export default SignUp;
