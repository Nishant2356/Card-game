"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-700 to-indigo-900">
      <Button 
        className="px-10 py-6 text-2xl rounded-2xl shadow-lg transition-transform hover:scale-105 hover:shadow-2xl"
        onClick={() => router.push("/battle-preparation")}
      >
        Start Game
      </Button>
    </div>
  );
}
 
export default Home;
