const config = {
    apiUrl: process.env.BACKEND_URL || "http://localhost:6767",
    socketUrl: process.env.BACKEND_URL_WS || "ws://localhost:6767"
  };
  
  export default config;
  