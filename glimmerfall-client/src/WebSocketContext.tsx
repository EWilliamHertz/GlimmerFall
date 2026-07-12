import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  socket: WebSocket | null;
  gameState: any | null;
  sendIntent: (type: string, payload: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  gameState: null,
  sendIntent: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<any | null>(null);
  const [clientId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    const wsUrl = window.location.hostname === 'localhost' ? 'ws://localhost:8080/ws' : `wss://${window.location.host}/api/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('Connected to Game Server');
      setSocket(newSocket);
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.clientId !== clientId) {
           setGameState(data);
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    newSocket.onclose = () => {
      console.log('Disconnected from Game Server');
      setSocket(null);
    };

    return () => {
      newSocket.close();
    };
  }, []);

  const sendIntent = (type: string, payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload, clientId }));
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, gameState, sendIntent }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
