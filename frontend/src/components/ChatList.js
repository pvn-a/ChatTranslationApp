import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List, ListItem, ListItemText, Container, Typography } from "@mui/material";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of chats from the backend
    const fetchChats = async () => {
      try {
        const response = await fetch("http://localhost:6767/chats");
        const data = await response.json();
        setChats(data); // Assuming data is an array of chat objects
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <Container style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Your Chats
      </Typography>
      <List>
        {chats.map((chat) => (
          <ListItem key={chat.id} button onClick={() => handleChatClick(chat.id)}>
            <ListItemText
              primary={chat.type === "group" ? chat.name : chat.username}
              secondary={chat.lastMessage}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ChatList;
