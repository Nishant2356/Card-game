"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, LogIn } from "lucide-react";

export default function StartingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-2xl bg-gray-900/80 backdrop-blur-xl border border-white/10 text-center p-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white tracking-wide">
              Welcome
            </CardTitle>
            <p className="text-white/60 text-sm mt-2">
              Choose an option to get started
            </p>
          </CardHeader>

          <CardContent>
            {/* Create Room */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/create-room-page")}
                className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-green-400 to-emerald-600 text-white font-semibold shadow-lg flex items-center justify-center gap-2 mb-6"
              >
                <Plus size={20} /> Create Room
              </Button>
            </motion.div>

            {/* Join Room */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/join-room-page")}
                className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-blue-400 to-indigo-600 text-white font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn size={20} /> Join Room
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Tip */}
        <p className="text-xs text-white/60 mt-6 text-center">
          Tip: Press <kbd className="px-1 py-0.5 bg-white/10 rounded">C</kbd> to create or{" "}
          <kbd className="px-1 py-0.5 bg-white/10 rounded">J</kbd> to join.
        </p>
      </motion.div>
    </div>
  );
}
