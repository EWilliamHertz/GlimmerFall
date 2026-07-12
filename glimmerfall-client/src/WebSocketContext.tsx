import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameState {
  players: any;
  currentTurn: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  gameState: GameState | null;
  sendIntent: (type: string, payload: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  gameState: null,
  sendIntent: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.on('state_update', (state: GameState) => {
      setGameState(state);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendIntent = (type: string, payload: any) => {
    if (socket) {
      socket.emit('action_intent', { type, payload });
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, gameState, sendIntent }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
