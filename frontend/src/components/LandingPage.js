import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h3" gutterBottom>
        Polyglot
      </Typography>
      {/* <Typography variant="h6" color="textSecondary" gutterBottom>
        Your logo here
      </Typography> */}
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/auth")}
          style={{ margin: "10px" }}
        >
          Start Chatting ..
        </Button>
        {/* <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => navigate("/anonymous")}
          style={{ margin: "10px" }}
        >
          Anonymous Chat
        </Button> */}
      </Box>
    </Container>
  );
};

export default LandingPage;
