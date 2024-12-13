import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import config from "./config";

const Chats = () => {
  const [interactions, setInteractions] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const username = sessionStorage.getItem("username"); // Get logged-in username from sessionStorage
  const navigate = useNavigate();

  // Fetch users the logged-in user has interacted with
  useEffect(() => {
    const fetchInteractedUsers = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/get-all-interacted-users?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          const sortedInteractions = data.interactions.sort(
            (a, b) => new Date(b.last_interaction) - new Date(a.last_interaction)
          );
          setInteractions(sortedInteractions);
        } else {
          console.error("Failed to fetch interacted users");
        }
      } catch (error) {
        console.error("Error fetching interacted users:", error);
      }
    };

    if (username) {
      fetchInteractedUsers();
    } else {
      console.error("No logged-in user found in sessionStorage");
    }
  }, [username]);

  // Fetch all available users
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/get-chat-users?current_username=${username}`);
        if (response.ok) {
          const data = await response.json();
          setAvailableUsers(data.users);
        } else {
          console.error("Failed to fetch available users");
        }
      } catch (error) {
        console.error("Error fetching available users:", error);
      }
    };

    if (username) {
      fetchAvailableUsers();
    }
  }, [username]);

  const handleUserClick = (receiverUsername) => {
    navigate(`/chat/${receiverUsername}`);
  };

  const handleSelectUser = (event) => {
    const selected = event.target.value;
    setSelectedUser(selected);
    if (selected) {
      navigate(`/chat/${selected}`);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Chats
      </Typography>

      {/* Dropdown for available users */}
      <Box mt={3}>
        <FormControl fullWidth>
          <InputLabel id="select-user-label">Select a User</InputLabel>
          <Select
            labelId="select-user-label"
            value={selectedUser}
            onChange={handleSelectUser}
            displayEmpty
          >
            {availableUsers.map((user) => (
              <MenuItem key={user} value={user}>
                {user}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* List of interactions */}
      <Box mt={4}>
        {interactions.length > 0 ? (
          <List>
            {interactions.map((interaction) => (
              <ListItem button key={interaction.user} divider onClick={() => handleUserClick(interaction.user)}>
                <ListItemText
                  primary={interaction.user}
                  secondary={
                    <>
                      {`Last interacted: ${new Date(interaction.last_interaction).toLocaleString()}`}
                      {interaction.message && <><br />Message: {interaction.message}</>}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">No interactions found.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default Chats;
