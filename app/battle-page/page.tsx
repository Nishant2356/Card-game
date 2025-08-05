"use client";
import { useState, useEffect } from "react";
import BattleCard from "@/components/BattleCard/page";
import DeckModal from "../modals/DeckModal";

export default function BattlePage() {
  const [player1DeckOpen, setPlayer1DeckOpen] = useState(false);
  const [player2DeckOpen, setPlayer2DeckOpen] = useState(false);
  const [player1Deck, setPlayer1Deck] = useState<any[]>([]);
  const [player2Deck, setPlayer2Deck] = useState<any[]>([]);

  // Load teams and fetch characters
  useEffect(() => {
    const storedTeams = localStorage.getItem("battleTeams");
    if (!storedTeams) return;

    const teams = JSON.parse(storedTeams);
    const allNames = teams.flatMap((team: any) => team.characters.map((char: any) => char.name));

    if (allNames.length === 0) return;

    fetch(`/api/characterByName?names=${encodeURIComponent(allNames.join(","))}`)
      .then((res) => res.json())
      .then((data) => {
        const mapDeck = (team: any) =>
          team.characters.map((char: any) => {
            const fullChar = data.find((c: any) => c.name === char.name);
            return {
              character: { ...fullChar, selectedMoves: char.moves },
              currentHP: fullChar?.stats?.hp || 100,
              maxHP: fullChar?.stats?.hp || 100,
            };
          });

        setPlayer1Deck(mapDeck(teams.find((t: any) => t.player === "Player 1")));
        setPlayer2Deck(mapDeck(teams.find((t: any) => t.player === "Player 2")));
      })
      .catch((err) => console.error("Error fetching characters:", err));
  }, []);

  // Separate active (on-field) and benched cards
  const player1Active = player1Deck.slice(0, 2);
  const player1Benched = player1Deck.slice(2);
  const player2Active = player2Deck.slice(0, 2);
  const player2Benched = player2Deck.slice(2);

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="grid grid-rows-[1fr_auto_1fr] grid-cols-3 gap-4 w-full max-w-6xl h-full">
        {/* Player 2 Deck Button */}
        <div
          className="flex items-center justify-center bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition justify-self-end"
          style={{ width: "100px", height: "100px" }}
          onClick={() => setPlayer2DeckOpen(true)}
        >
          <span className="text-sm font-bold text-center">Player 2 Deck</span>
        </div>

        {/* Player 2 Active Cards */}
        <div className="col-span-2 flex justify-center space-x-4">
          {player2Active.map((card, idx) => (
            <BattleCard
              key={idx}
              character={card.character}
              currentHP={card.currentHP}
              maxHP={card.maxHP}
              selectedMoves={card.character.selectedMoves}
            />
          ))}
        </div>

        {/* VS Banner */}
        <div className="col-span-3 flex justify-center items-center text-4xl font-bold text-white">
          VS
        </div>

        {/* Player 1 Active Cards */}
        <div className="col-span-2 flex justify-center space-x-4">
          {player1Active.map((card, idx) => (
            <BattleCard
              key={idx}
              character={card.character}
              currentHP={card.currentHP}
              maxHP={card.maxHP}
              selectedMoves={card.character.selectedMoves}
            />
          ))}
        </div>

        {/* Player 1 Deck Button */}
        <div
          className="flex items-center justify-center bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition justify-self-start"
          style={{ width: "100px", height: "100px" }}
          onClick={() => setPlayer1DeckOpen(true)}
        >
          <span className="text-sm font-bold text-center">Player 1 Deck</span>
        </div>
      </div>

      {/* Player 2 Deck Modal - benched only */}
      <DeckModal
        open={player2DeckOpen}
        onOpenChange={setPlayer2DeckOpen}
        title="Player 2 Deck"
        deck={player2Benched} // Only benched cards
      />

      {/* Player 1 Deck Modal - benched only */}
      <DeckModal
        open={player1DeckOpen}
        onOpenChange={setPlayer1DeckOpen}
        title="Player 1 Deck"
        deck={player1Benched} // Only benched cards
        showSwap
      />
    </div>
  );
}
