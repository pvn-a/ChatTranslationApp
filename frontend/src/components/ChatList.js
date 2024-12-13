import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, List, ListItem, ListItemText, Box, Button, TextField } from "@mui/material";
import config from "./config";

const Chats = () => {
  const [interactions, setInteractions] = useState([]);
  const username = sessionStorage.getItem("username"); // Get logged-in username from sessionStorage
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInteractedUsers = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/get-all-interacted-users?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          // Sort interactions by the `last_interaction` timestamp in descending order
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

  const handleUserClick = (receiverUsername) => {
    navigate(`/chat/${receiverUsername}`);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Chats
      </Typography>
      <Box mt={2}>
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
