// NotificationComponent.js
import React, { useState, useEffect } from "react";
import { Snackbar, Box } from "@mui/material";
import { useWebSocketContext } from "./WebSocket"; // Assuming WebSocketContext is already implemented

const NotificationComponent = () => {
  const { notification } = useWebSocketContext(); // Access notification from context
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notification) {
      console.log(notification);
      setOpen(true); // Open snackbar when a new notification arrives
    }
  }, [notification]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      message={notification} // Show the notification message
      autoHideDuration={5000} // Automatically hide after 5 seconds
      anchorOrigin={{ vertical: "top", horizontal: "right" }} // Default snackbar positioning
    >
      <Box
        style={{
          position: "fixed",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "#f5f5f5",
          color: "#000",
          padding: "10px 20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        {notification}
      </Box>
    </Snackbar>
  );
};

export default NotificationComponent;
