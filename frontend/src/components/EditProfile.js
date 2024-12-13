import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import config from "./config";

const EditProfile = () => {
  const [newLanguage, setNewLanguage] = useState("");
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  const handleSaveLanguage = async () => {
    if (!username || !newLanguage) {
      alert("Please select a valid language.");
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/update-language-preference`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, new_language: newLanguage }),
      });

      if (response.ok) {
        sessionStorage.setItem("language_preference", newLanguage);
        alert("Profile updated successfully!");
        navigate("/chats");
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">Preferred Language</InputLabel>
          <Select
            labelId="language-select-label"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="de">German</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveLanguage}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/chats")}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
};

export default EditProfile;