import { Socket } from "socket.io-client";

export interface ServerToClientEvents {
  "message-response": (message: string) => void;
  // Add other server-to-client events here
}

export interface ClientToServerEvents {
  message: (message: string) => void;
  // Add other client-to-server events here
}

export type CustomSocket = Socket<ServerToClientEvents, ClientToServerEvents>;