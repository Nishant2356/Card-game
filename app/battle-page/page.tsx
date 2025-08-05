"use client";
import { useState, useEffect } from "react";
import BattleCard from "@/components/BattleCard/page";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function BattlePage() {
  const [player1DeckOpen, setPlayer1DeckOpen] = useState(false);
  const [player2DeckOpen, setPlayer2DeckOpen] = useState(false);
  const [player1Deck, setPlayer1Deck] = useState<any[]>([]);
  const [player2Deck, setPlayer2Deck] = useState<any[]>([]);

  // Load teams and fetch only needed characters
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
              character: {
                ...fullChar,
                selectedMoves: char.moves, // Use the selected moves
              },
              currentHP: fullChar?.stats?.hp || 100,
              maxHP: fullChar?.stats?.hp || 100,
              props: {
                onClick: () => console.log(`${team.player} clicked on ${char.name}`),
              },
            };
          });

        setPlayer1Deck(mapDeck(teams.find((t: any) => t.player === "Player 1")));
        setPlayer2Deck(mapDeck(teams.find((t: any) => t.player === "Player 2")));
      })
      .catch((err) => console.error("Error fetching characters:", err));
  }, []);

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
          {player2Deck.slice(0, 2).map((card, idx) => (
            <BattleCard
              key={idx}
              big
              character={card.character}
              selectedMoves={card.character.selectedMoves} // 🔹 Pass selected moves
              currentHP={card.currentHP}
              maxHP={card.maxHP}
              {...card.props}
            />
          ))}
        </div>

        {/* VS Banner */}
        <div className="col-span-3 flex justify-center items-center text-4xl font-bold text-white">
          VS
        </div>

        {/* Player 1 Active Cards */}
        <div className="col-span-2 flex justify-center space-x-4">
          {player1Deck.slice(0, 2).map((card, idx) => (
            <BattleCard
              key={idx}
              big
              character={card.character}
              selectedMoves={card.character.selectedMoves} // 🔹 Pass selected moves
              currentHP={card.currentHP}
              maxHP={card.maxHP}
              {...card.props}
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

      {/* Player 2 Deck Modal */}
      <Dialog open={player2DeckOpen} onOpenChange={setPlayer2DeckOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Player 2 Deck</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-4">
            {player2Deck.map((card, idx) => (
              <BattleCard
                key={idx}
                character={card.character}
                selectedMoves={card.character.selectedMoves} // 🔹 Pass selected moves
                currentHP={card.currentHP}
                maxHP={card.maxHP}
                {...card.props}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Player 1 Deck Modal */}
      <Dialog open={player1DeckOpen} onOpenChange={setPlayer1DeckOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Player 1 Deck</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-4">
            {player1Deck.map((card, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <BattleCard
                  character={card.character}
                  selectedMoves={card.character.selectedMoves} // 🔹 Pass selected moves
                  currentHP={card.currentHP}
                  maxHP={card.maxHP}
                  {...card.props}
                />
                <Button className="mt-2">Swap In</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
