import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";

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
    <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h3" gutterBottom>
        Polyglot
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleStartChatting}
          style={{ margin: "10px" }}
        >
          Start Chatting ..
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage;
