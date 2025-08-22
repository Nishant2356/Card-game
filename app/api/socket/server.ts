import { Server, Socket } from "socket.io";
import express from 'express';
import { createServer } from 'node:http';
const playerStack: PlayerType[] = ["Player 1", "Player 2"];
type PlayerType = "Player 1" | "Player 2";
type PlayerMap = {
  [socketId: string]: PlayerType; // No undefined here
};
export type Move = {
  id: string;
  name: string;
  categories: string[];
  roles: string[];
  effects: string[];
  affectedStats: { stat: string; amount: number }[];
  affectedStats2: { stat: string; amount: number }[];
  power: number;
  accuracy: number;
  healamount: number
  targetTypes: string[];
  duration: number;
  moveType: "physical" | "special";
  contact: boolean;
  exceptionHandler?: string;
  moveSound?: string;
  animation?: string;
  relatedCharacters: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type Deck = {
  deckid: string;
  player: "Player 1" | "Player 2";
  character: Character & { selectedMoves: any[] };
  maxHP: number;
  currentStats: any;
}

export type Ability = { name: string; description: string };
export type Character = {
  id: number;
  name: string;
  title: string;
  universe: string;
  image: string;
  stats: { hp: number; attack: number; defense: number; speed: number };
  movePool: Move[];
  abilities: { special: Ability; hidden: Ability };
  theme: { primaryColor: string; secondaryColor: string; borderColor: string; glowColor: string };
};

export type TargetDetails = {
  deckid: string;
  character: Character;
  player: "Player 1" | "Player 2";
  targetIndex: number; // index of the active slot at selection time (0..)
};

export type SelectedMove = {
  deckid: string; // deckid of the move maker card
  player: "Player 1" | "Player 2";
  moveMaker: Character;
  targets: TargetDetails[];
  move: Move;
};

export type StatEffect = {
  id: string;
  moveDetails: Move;
  affectedStats: { stat: string; amount: number }[];
  duration: number;
  targets: TargetDetails[];
};


interface Player {
  id: string;
  name: string;
  player: PlayerType;
}

interface RoomState {
  player1Deck: Deck[];
  player2Deck: Deck[];
  faintedPlayer1: { [key: string]: boolean };
  faintedPlayer2: { [key: string]: boolean };
  activePlayer1Count: number,
  activePlayer2Count: number,
  turn: PlayerType | null;
  selectedMoves: SelectedMove[]; // playerId -> move
  glowingCards: any[];
  round: number;
  teamsLoaded: boolean;
  processingMoves: boolean;
}


interface Room {
  players: Player[];
  roomPlayers: PlayerType[];
  state: RoomState;
}

// In-memory storage for rooms
const rooms: Record<string, Room> = {};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your Next.js frontend URL
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);

  // Player creates a room
  socket.on("createRoom", ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    if (rooms[roomId]) {
      socket.emit("error", "Room already exists");
      return;
    }

    rooms[roomId] = {
      players: [],
      roomPlayers: ["Player 2", "Player 1"],
      state: {
        player1Deck: [],
        player2Deck: [],
        faintedPlayer1: {},
        faintedPlayer2: {},
        activePlayer1Count: 4,
        activePlayer2Count: 4,
        turn: null,
        selectedMoves: [],
        glowingCards: [],
        round: 1,
        teamsLoaded: false,
        processingMoves: false
      },
    };


    if (rooms[roomId].roomPlayers.length > 0) {
      const assignedPlayer: PlayerType = rooms[roomId].roomPlayers.pop() as PlayerType; // Take top color
      rooms[roomId].players.push({ id: socket.id, name: playerName, player: assignedPlayer })
      socket.join(roomId);
      socket.emit("roomCreated", { roomId: roomId, player: assignedPlayer });
      console.log(`Room ${roomId} created by ${playerName}`);
    } else {
      console.log("can only join two players") //no players left
    }
  });

  // Player joins a room
  socket.on("joinRoom", ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("error", "Room does not exist");
      return;
    }

    if (rooms[roomId].roomPlayers.length > 0) {
      const assignedPlayer: PlayerType = rooms[roomId].roomPlayers.pop() as PlayerType; // Take top color
      rooms[roomId].players.push({ id: socket.id, name: playerName, player: assignedPlayer })
      socket.join(roomId);
    } else {
      console.log("can only join two players") //no players left
    }

    socket.join(roomId);

    io.to(roomId).emit("playerJoined", {
      players: room.players,
    });

    console.log(`${playerName} joined ${roomId}`);
  });


  // When a player selects a team
  socket.on("teamSelected", ({ teams, roomId }) => {
    console.log("Team selected for room:", roomId, teams);
    io.to(roomId).emit("teamSelected", teams); // broadcast to everyone in the room
  });

  // Optional: trigger battle prep navigation
  socket.on("goToBattle", (roomId) => {
    io.to(roomId).emit("goToBattle", roomId);
  });

  socket.on("getPlayerData", (roomId) => {
    io.to(roomId).emit("getPlayerData", rooms[roomId].players);
  });
  
  socket.on('gameNotification', ({ roomId, type, message, originId, ...meta }) => {
    // validate inputs, sanitize, authorize, etc.
    // forward to everyone in the room except sender
    socket.to(roomId).emit('gameNotification', { type, message, originId, ...meta });
  });

  socket.on("syncGameState", ({roomId, gameState}) => {
    // store it if needed, or just broadcast
    console.log(roomId, gameState);
    socket.to(roomId).emit("updateGameState", gameState);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [roomId, room] of Object.entries(rooms)) {
      room.players = room.players.filter((p) => p.id !== socket.id);
      io.to(roomId).emit("playerLeft", { players: room.players });

      // If room empty, delete
      if (room.players.length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted`);
      }
    }
  });
});

const PORT = 3001; // Different port from Next.js
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
