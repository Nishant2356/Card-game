"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-black text-white">
      <h1 className="text-6xl font-extrabold mb-10 drop-shadow-lg">
        Battle Arena
      </h1>

      <Button
        className="px-12 py-6 text-2xl font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-purple-600"
        onClick={() => router.push("/battle-preparation")}
      >
        Start Game
      </Button>

      <p className="mt-8 text-lg text-gray-300 opacity-80">
        Prepare your teams and fight for victory
      </p>
    </div>
  );
};

export default Home;
