import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Box, TextField, Button, List, ListItem, ListItemText } from "@mui/material";
import config from "./config";

const ChatScreen = () => {
  const { receiverUsername } = useParams(); // Get the receiver's username from the URL
  const senderUsername = sessionStorage.getItem("username"); // Get the logged-in user's username
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/chat-history?user1=${senderUsername}&user2=${receiverUsername}`
        );
        if (response.ok) {
          const data = await response.json();
          const sortedMessages = data.chat_history.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sortedMessages);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [senderUsername, receiverUsername]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageBody = {
      sender_username: senderUsername,
      receiver_username: receiverUsername,
      message: newMessage.trim(),
    };

    try {
      const response = await fetch(`${config.apiUrl}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageBody),
      });

      if (response.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: senderUsername,
            receiver: receiverUsername,
            original_message: newMessage.trim(),
            translated_message: newMessage.trim(),
            timestamp: new Date().toISOString(),
          },
        ]);
        setNewMessage("");
        scrollToBottom();
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px", color: "#f5f5f5" }}>
      {/* Set bluish color for the header */}
      <Typography
        variant="h4"
        gutterBottom
        style={{ color: "#1E90FF", fontWeight: "bold" }} // Bluish color for the header
      >
        Chat with {receiverUsername}
      </Typography>
      <Box
        style={{
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "10px",
          height: "400px",
          overflowY: "scroll",
          marginBottom: "10px",
          backgroundColor: "#222", // Background for the chat box
        }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              style={{
                textAlign: msg.sender === senderUsername ? "right" : "left",
                display: "flex",
                flexDirection: msg.sender === senderUsername ? "row-reverse" : "row",
              }}
            >
              <ListItemText
                primary={
                  <span style={{ color: "#ffffff" }}>
                    {msg.sender === senderUsername
                      ? msg.original_message
                      : msg.translated_message}
                  </span>
                }
                secondary={
                  <span style={{ color: "#cccccc" }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                }
                style={{
                  backgroundColor: msg.sender === senderUsername ? "#2a6041" : "#8b3f4c",
                  borderRadius: "12px",
                  padding: "10px 15px",
                  maxWidth: "70%",
                }}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box display="flex" gap={2}>
        <TextField
          variant="outlined"
          placeholder="Type your message..."
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            style: {
              backgroundColor: "#333", // Dark background for the input box
              color: "#ffffff",
              borderRadius: "8px",
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          style={{
            backgroundColor: "#0056b3", // Button color
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default ChatScreen;
