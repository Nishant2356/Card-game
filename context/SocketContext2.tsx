// context/SocketContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io';
import { useSocket } from '@/hooks/useSocket';

type PlayerType = "player1" | "player2";
type PlayerMap = Record<string, PlayerType>;

interface SocketContextType {
  playerMap: PlayerMap;
  setPlayerMap: (map: PlayerMap) => void;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [playerMap, setPlayerMap] = useState<PlayerMap>({});
  const [isConnected, setIsConnected] = useState(false);
    // Initialize socket connection
  const socket = useSocket();

  socket?.on('assignPlayer', (data) => {
    setPlayerMap(data);
  });

  return (
    <SocketContext.Provider value={{ 
      playerMap, 
      setPlayerMap, 
      socket,
      isConnected
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}