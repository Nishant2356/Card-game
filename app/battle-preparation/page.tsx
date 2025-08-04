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

  const handleConfirmSelection = (player: string, characters: any) => {
    // Replace existing player selection if they reselect
    setTeams((prev) => {
      const filtered = prev.filter((t) => t.player !== player);
      return [...filtered, { player, characters }];
    });
    setOpenModal(false);
  };

  const goToBattle = () => {
    router.push("/battle");
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-10">
      {/* Player 1 Selection */}
      <Button
        className="w-60 py-6 text-xl rounded-2xl shadow-lg"
        onClick={() => handleOpenModal("Player 1")}
      >
        {teams.find((t) => t.player === "Player 1")
          ? "Re-select Player 1"
          : "Select Player 1"}
      </Button>

      {/* VS in the middle */}
      <h1 className="text-6xl font-extrabold text-white">VS</h1>

      {/* Player 2 Selection */}
      <Button
        className="w-60 py-6 text-xl rounded-2xl shadow-lg"
        onClick={() => handleOpenModal("Player 2")}
      >
        {teams.find((t) => t.player === "Player 2")
          ? "Re-select Player 2"
          : "Select Player 2"}
      </Button>

      {/* Show battle button only when both players selected */}
      {teams.length === 2 && (
        <Button
          className="mt-6 w-60 py-4 text-xl rounded-2xl shadow-lg bg-green-600 hover:bg-green-500"
          onClick={goToBattle}
        >
          Start Battle
        </Button>
      )}

      {/* Modal for character selection */}
      <CharacterSelectionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmSelection}
        player={currentPlayer}
      />
    </div>
  );
}
