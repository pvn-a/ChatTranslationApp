from fastapi import WebSocket

class ConnectionManager:
    _instance = None  # Class-level attribute to store the singleton instance

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "active_connections"):
            self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        if websocket not in self.active_connections:
            await websocket.accept()
            self.active_connections.append(websocket)
            # print(f"New WebSocket connection added: {id(websocket)}. Total connections: {len(self.active_connections)}")
        else:
            print(f"WebSocket connection already exists: {id(websocket)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            # print(f"WebSocket connection removed: {id(websocket)}. Total connections: {len(self.active_connections)}")
        else:
            print(f"Attempted to remove a non-existent connection: {id(websocket)}")

    async def broadcast(self, message: str):
        print(f"Broadcasting message: {message}")
        print(f"Active connections before broadcast: {len(self.active_connections)}")
        disconnected_clients = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
                print(f"Message sent to a connection: {message}")
            except Exception as e:
                # print(f"Failed to send message: {e}")
                disconnected_clients.append(connection)

        # Remove disconnected clients
        for client in disconnected_clients:
            self.disconnect(client)
        print(f"Active connections after cleanup: {len(self.active_connections)}")

