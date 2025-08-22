"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button"; // Replace with your own button if not using shadcn
import { Trophy } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Load react-confetti only on the client
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

const WinnerPage = ({ winnerName = "You" }) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const searchParams = useSearchParams();
  const winner = searchParams.get("winner");

  // Only set window size after component mounts (avoids SSR mismatch)
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    handleResize(); // set initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Optional victory sound
  useEffect(() => {
    if (isMounted) {
      const audio = new Audio("/sounds/victory.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [isMounted]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 via-indigo-700 to-purple-900 text-white overflow-hidden">
      {isMounted && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {/* Glowing Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="mb-6"
      >
        <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
      </motion.div>

      {/* Winner Text */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold tracking-widest text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]"
      >
        🎉 Battle Over 🎉
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-3xl mt-3 font-light italic text-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.7)]"
      >
        {winner} is the Champion!
      </motion.h2>

      {/* Play Again Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-10"
      >
        <Button
          size="lg"
          className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-2xl shadow-lg hover:bg-yellow-300 transition-all duration-200"
          onClick={() => (window.location.href = "/")}
        >
          Play Again
        </Button>
      </motion.div>
    </div>
  );
};

export default WinnerPage;
