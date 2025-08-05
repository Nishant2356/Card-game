"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CharacterSelectionModal from "../modals/CharacterSelectionModal";

export default function BattlePreparation() {
  const [openModal, setOpenModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const router = useRouter();

  const handleOpenModal = (player: string) => {
    setCurrentPlayer(player);
    setOpenModal(true);
  };

  // Save selected characters (with moves) for a player
  const handleConfirmSelection = (player: string, characters: any[]) => {
    setTeams((prev) => {
      const filtered = prev.filter((t) => t.player !== player);
      return [...filtered, { player, characters }];
    });
    setOpenModal(false);
  };

  const goToBattle = () => {
    localStorage.setItem("battleTeams", JSON.stringify(teams));
    console.log(teams)
    router.push("/battle-page");
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-10">
      <Button className="w-60 py-6 text-xl rounded-2xl shadow-lg" onClick={() => handleOpenModal("Player 1")}>
        {teams.find((t) => t.player === "Player 1") ? "Re-select Player 1" : "Select Player 1"}
      </Button>

      <h1 className="text-6xl font-extrabold text-white">VS</h1>

      <Button className="w-60 py-6 text-xl rounded-2xl shadow-lg" onClick={() => handleOpenModal("Player 2")}>
        {teams.find((t) => t.player === "Player 2") ? "Re-select Player 2" : "Select Player 2"}
      </Button>

      {teams.length === 2 && (
        <Button className="mt-6 w-60 py-4 text-xl rounded-2xl shadow-lg bg-green-600 hover:bg-green-500" onClick={goToBattle}>
          Start Battle
        </Button>
      )}

      <CharacterSelectionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmSelection}
        player={currentPlayer}
      />
    </div>
  );
}
