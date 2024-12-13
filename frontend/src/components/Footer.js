import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1E1E1E",
        color: "#ffffff",
        textAlign: "center",
        padding: "10px 0",
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.5)",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Polyglot - Pavan & Nishchal
      </Typography>
    </Box>
  );
};

export default Footer;
