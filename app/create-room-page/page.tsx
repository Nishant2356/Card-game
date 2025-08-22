"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSocketContext } from "@/context/SocketContext";
import { useRouter } from "next/navigation";

type PlayerType = "Player 1" | "Player 2";
type PlayerMap = {
    [socketId: string]: PlayerType; // No undefined here
};

export default function CreateRoomPage() {
  const { socket, setMyRoomId, setMyName, setPlayerMap, playerMap} = useSocketContext();
  const [roomId, setRoomId] = useState("");
  const router =  useRouter();

  const handleCreateRoom = () => {
    if (!roomId.trim()) return;

    socket?.emit("createRoom", { roomId, playerName: "Nishant" });

    socket?.on("roomCreated", ({ roomId, player }) => {
      console.log("Room created successfully:", roomId, "as", player);
      
      setPlayerMap({
        ...playerMap,
        [socket?.id as string]: player,
      });
      router.push("/battle-preparation");
    });

    setMyRoomId(roomId);
    setMyName("Nishant");

    socket?.on("error", (msg) => {
      console.error("Error:", msg);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-2xl bg-gray-900/80 backdrop-blur-xl border border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white tracking-wide">
              Create a Room
            </CardTitle>
            <p className="text-white/60 text-sm mt-2">
              Set up your room and invite friends to join
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Room ID
              </label>
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="bg-gray-800/60 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleCreateRoom}
                className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
              >
                Create Room
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
