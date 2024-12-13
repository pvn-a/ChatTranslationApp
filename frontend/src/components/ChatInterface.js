import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
} from "@mui/material";
import config from "./config";

const ChatInterface = () => {
  const { chatId } = useParams(); // Get the chat ID from the URL
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [page, setPage] = useState(1);
  const chatContainerRef = useRef(null);

  // Memoize fetchMessages to prevent recreation
  const fetchMessages = useCallback(
    async (loadMore = false) => {
      try {
        const response = await fetch(
          `${config.apiUrl}/chats/${chatId}/messages?page=${loadMore ? page : 1}&limit=5`
        );
        const data = await response.json();

        if (loadMore) {
          setMessages((prevMessages) => [...data.reverse(), ...prevMessages]); // Prepend new messages
          setPage((prevPage) => prevPage + 1);
        } else {
          setMessages(data.reverse());
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    [chatId, page] // Dependencies for the function
  );

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        await fetch(`${config.apiUrl}/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputMessage }),
        });
        setInputMessage(""); // Clear input field
        fetchMessages(); // Refresh messages
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current.scrollTop === 0) {
      fetchMessages(true); // Load more messages when scrolled to top
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]); // Add fetchMessages as a dependency

  return (
    <Container style={{ marginTop: "20px" }}>
      <Box
        ref={chatContainerRef}
        onScroll={handleScroll}
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "5px",
          marginBottom: "10px",
          padding: "10px",
        }}
      >
        <List>
          {messages.map((message) => (
            <ListItem key={message.id}>
              <ListItemText
                primary={message.text}
                secondary={message.sender}
                style={{
                  textAlign: message.isMine ? "right" : "left",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box display="flex" gap={2}>
        <TextField
          variant="outlined"
          placeholder="Type your message..."
          fullWidth
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default ChatInterface;
