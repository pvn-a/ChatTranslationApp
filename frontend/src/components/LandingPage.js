import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, Box, Paper } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartChatting = () => {
    const username = sessionStorage.getItem("username");
    if (username) {
      navigate("/chats");
    } else {
      navigate("/login");
    }
  };

  return (
    <Container
      maxWidth="md"
      style={{ textAlign: "center", marginTop: "100px", padding: "20px" }}
    >
      <Paper elevation={3} style={{ padding: "30px", borderRadius: "15px" }}>
        <Typography variant="h2" gutterBottom style={{ fontWeight: "bold", color: "#1976d2" }}>
          Welcome to Polyglot
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          style={{ margin: "20px 0", fontStyle: "italic" }}
        >
          Breaking language barriers, one message at a time.
        </Typography>

        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ChatIcon />}
            onClick={handleStartChatting}
            style={{ padding: "10px 20px", fontSize: "18px" }}
          >
            Start Chatting
          </Button>
        </Box>

        <Box mt={6} style={{ textAlign: "left" }}>
          <Typography variant="h5" gutterBottom style={{ fontWeight: "bold" }}>
            How to Run the Application:
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            1. Ensure you have logged in or signed up to access chat functionalities.
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            2. Navigate to "Start Chatting" to explore the chat interface, and select the user you want to start a chat with.
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            3. You can also change your language preference in PROFILE - Edit Profile.
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            4. Enjoy chatting!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LandingPage;
