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
  const [notifications, setNotifications] = useState([]);
  const username = sessionStorage.getItem("username");
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/get-notifications?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          const sortedNotifications = data.notifications.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setNotifications(sortedNotifications);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const interval = setInterval(fetchNotifications, 5000);
    fetchNotifications();
    return () => clearInterval(interval);
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
    <Container maxWidth="sm" style={{ marginTop: "20px", paddingBottom: "120px" }}>
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

      {/* Scrollable Chat List */}
      <Box
        mt={4}
        sx={{
          maxHeight: "305px", // Reduced height for the chat list
          overflowY: "auto",
          backgroundColor: "#1e1e1e",
          borderRadius: "10px",
          padding: "10px",
          border: "1px solid #444",
        }}
      >
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

      {/* Notifications Section */}
      <Box
        mt={4}
        sx={{
          backgroundColor: "#2e2e2e",
          borderRadius: "10px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          maxHeight: "150px",
          overflowY: "auto",
          color: "#ffffff",
          padding: "10px",
          border: "1px solid #444",
        }}
      >
        <Typography variant="h6" gutterBottom style={{ color: "#00bcd4" }}>
          Notifications
        </Typography>
        <List>
          {notifications.map((notification, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={`${new Date(notification.timestamp).toLocaleString()}: ${notification.message}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default Chats;
