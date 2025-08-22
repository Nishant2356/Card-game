import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors'; // Install with: npm install cors
const playerStack: PlayerType[] = ["Player 1", "Player 2"]; 
type PlayerType = "Player 1" | "Player 2";
type PlayerMap = {
  [socketId: string]: PlayerType; // No undefined here
};

// Initialize with correct typing
const playerMap: PlayerMap = {}; 

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your Next.js frontend URL
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

    // Assign color if available
    if (playerStack.length > 0) {
      const assignedPlayer: PlayerType = playerStack.pop() as PlayerType; // Take top color
      playerMap[socket.id] = assignedPlayer; // Store mapping
  
      // Send assigned color to that user only
      io.emit('assignPlayer', playerMap);
      
    } else {
      socket.emit('assignPlayer', { id: socket.id, player: null }); // No colors left
    }
  
  // // Example: Send a welcome message
  // socket.emit('welcome', { 
  //   id: socket.id, 
  //   playerType: playerMap[socket.id] 
  // });

  
  socket.on('teamSelected', (teams) => {
    console.log(teams)
    io.emit("teamSelected", teams)
  });

  socket.on('goToBattlePrep', (data) => {
    io.emit("goToBattlePrep", data)
  });

  socket.on('goToBattle', (data) => {
    io.emit("goToBattle", data)
  });

  socket?.on('deckUpdate', (data) => {
    socket.broadcast.emit("deckUpdate", data);
  });

  socket?.on('playerFainted', (data) => {
    socket.broadcast.emit("playerFainted", data);
  });

  socket?.on('turnUpdate', (data) => {
    socket.broadcast.emit("turnUpdate", data);  });

  socket?.on('movesSelected', (data) => {
    socket.broadcast.emit("movesSelected", data);  });

  socket?.on('glowingCards', (data) => {
    socket.broadcast.emit("glowingCards", data);
  });

  socket?.on('roundUpdate', (data) => {
    socket.broadcast.emit("roundUpdate", data);
  });

  socket?.on('opponentTeamLoaded', (data) => {
    socket.broadcast.emit("opponentTeamLoaded", data);
  });

  socket?.on('processingMoves', (data) => {
    socket.broadcast.emit("processingMoves", data);
  });
  
  socket?.on('showToast', (data) => {
    socket.broadcast.emit("showToast", data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (playerMap[socket.id]) { 
      playerStack.push(playerMap[socket.id]); // Put color back on stack
      delete playerMap[socket.id]; // Remove mapping
    }
  });

});

const PORT = 3001; // Different port from Next.js
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});