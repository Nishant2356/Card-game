// context/SocketContext.tsx
"use client";

import { useSocket } from "@/hooks/useSocket";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DefaultEventsMap } from "socket.io";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
    socket: Socket | null;
    myRoomId: string | null;
    myName: string | null;
    setMyRoomId: (id: string) => void;
    setMyName: (name: string) => void;
    playerMap: PlayerMap;
    setPlayerMap: (map: PlayerMap) => void;
};

type PlayerType = "Player 1" | "Player 2";
type PlayerMap = {
    [socketId: string]: PlayerType; // No undefined here
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socket = useSocket();
    const [myRoomId, setMyRoomId] = useState<string | null>(null);
    const [myName, setMyName] = useState<string | null>(null);
    const [playerMap, setPlayerMap] = useState<PlayerMap>({});

    useEffect(() => {
        console.log(myName, myRoomId, socket?.id)
    }, [myName, myRoomId])

    return (
        <SocketContext.Provider value={{ socket, myRoomId, myName, setMyRoomId, setMyName, playerMap, setPlayerMap }}>{children}</SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within a SocketProvider");
    }
    return context;
};

