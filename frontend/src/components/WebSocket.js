// WebSocketContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import config from "./config";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const { sendJsonMessage, lastMessage } = useWebSocket(`ws://${config.socketUrl}/ws`, {
    onOpen: () => console.log("WebSocket connection opened"),
    onClose: () => console.log("WebSocket connection closed"),
    shouldReconnect: () => true, // Reconnect on disconnection
  });

  useEffect(() => {
    if (lastMessage !== null) {
      setNotification(lastMessage.data); // Update notification state
    }
  }, [lastMessage]);

  return (
    <WebSocketContext.Provider value={{ notification, sendJsonMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
