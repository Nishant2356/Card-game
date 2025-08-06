"use client";
import { useState, useEffect } from "react";
import BattleCard, { Move, Character } from "@/components/BattleCard/page";
import DeckModal from "../modals/DeckModal";

type TargetDetails = {
  character: Character;
  currentHP: number;
  currentStats: { hp: number; attack: number; defense: number; speed: number };
};

type SelectedMove = {
  player: "Player 1" | "Player 2";
  moveMaker: TargetDetails;
  targets: TargetDetails[];
  move: Move;
};

export default function BattlePage() {
  const [player1DeckOpen, setPlayer1DeckOpen] = useState(false);
  const [player2DeckOpen, setPlayer2DeckOpen] = useState(false);
  const [player1Deck, setPlayer1Deck] = useState<any[]>([]);
  const [player2Deck, setPlayer2Deck] = useState<any[]>([]);
  const [turn, setTurn] = useState<"Player 1" | "Player 2">("Player 1");
  const [selectedMoves, setSelectedMoves] = useState<SelectedMove[]>([]);
  const [targetModal, setTargetModal] = useState<{
    type: "single" | "double";
    moveMaker: TargetDetails;
    move: Move;
    player: "Player 1" | "Player 2";
  } | null>(null);
  const [tempTargets, setTempTargets] = useState<TargetDetails[]>([]);

  // Helper for unique keys
  const getUniqueKey = (player: string, id: string | number) => `${player}-${id}`;

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
      });
  }, []);

  const player1Active = player1Deck.slice(0, 2);
  const player1Benched = player1Deck.slice(2);
  const player2Active = player2Deck.slice(0, 2);
  const player2Benched = player2Deck.slice(2);

  const battlefieldCards = [...player1Active, ...player2Active];

  const handleMoveSelect = async (
    player: "Player 1" | "Player 2",
    character: Character,
    currentHP: number,
    move: Move | null
  ) => {
    setSelectedMoves((prev) => prev.filter((m) => !(m.player === player && m.moveMaker.character.id === character.id)));
    if (!move) return;

    // Fetch full move details from API
    const fullMove = await fetch(`/api/moveByName?names=${encodeURIComponent(move.name)}`).then((res) => res.json());
    if (!fullMove || fullMove.length === 0) return;
    const moveDetails = fullMove[0];

    const moveMaker = {
      character,
      currentHP,
      currentStats: { ...character.stats, hp: currentHP },
    };

    // Iterate over targetTypes
    for (const targetType of moveDetails.targetTypes) {
      if (targetType === "self") {
        const targets = [moveMaker];
        addMove(player, moveMaker, targets, moveDetails);
        return;
      }
      if (targetType === "all") {
        const targets = battlefieldCards
          .filter((c) => c.character.id !== character.id)
          .map((c) => ({
            character: c.character,
            currentHP: c.currentHP,
            currentStats: { ...c.character.stats, hp: c.currentHP },
          }));
        addMove(player, moveMaker, targets, moveDetails);
        return;
      }
      if (targetType === "single") {
        setTargetModal({ type: "single", moveMaker, move: moveDetails, player });
        return;
      }
      if (targetType === "double") {
        setTargetModal({ type: "double", moveMaker, move: moveDetails, player });
        return;
      }
    }
  };

  const addMove = (
    player: "Player 1" | "Player 2",
    moveMaker: TargetDetails,
    targets: TargetDetails[],
    move: Move
  ) => {
    setSelectedMoves((prev) => [...prev, { player, moveMaker, targets, move }]);
    setTargetModal(null);
    setTempTargets([]);
  };

  const handleTargetConfirm = () => {
    if (!targetModal) return;
    const required = targetModal.type === "single" ? 1 : 2;
    if (tempTargets.length !== required) return;
    addMove(targetModal.player, targetModal.moveMaker, tempTargets, targetModal.move);
  };

  const toggleTempTarget = (card: any) => {
    const targetObj = {
      character: card.character,
      currentHP: card.currentHP,
      currentStats: { ...card.character.stats, hp: card.currentHP },
    };
    setTempTargets((prev) => {
      if (prev.find((t) => t.character.id === card.character.id)) {
        return prev.filter((t) => t.character.id !== card.character.id);
      } else {
        if (targetModal?.type === "single") return [targetObj];
        if (targetModal?.type === "double" && prev.length < 2) return [...prev, targetObj];
        return prev;
      }
    });
  };

  const currentPlayerActive = turn === "Player 1" ? player1Active : player2Active;
  const currentPlayerSelections = selectedMoves.filter((m) => m.player === turn);
  const canConfirm = currentPlayerSelections.length === currentPlayerActive.length;

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (turn === "Player 1") {
      setTurn("Player 2");
    } else {
      const sortedMoves = [...selectedMoves].sort(
        (a, b) => (b.moveMaker.currentStats.speed || 0) - (a.moveMaker.currentStats.speed || 0)
      );
      console.log("Final resolved moves:", sortedMoves);
      setTurn("Player 1");
      setSelectedMoves([]);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <h2 className="text-white text-xl mb-4">{turn}'s Turn</h2>
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
          {player2Active.map((card) => (
            <BattleCard
              key={getUniqueKey("Player2", card.character.id)}
              character={card.character}
              currentHP={card.currentHP}
              maxHP={card.maxHP}
              selectedMoves={card.character.selectedMoves}
              onMoveSelect={(move) => handleMoveSelect("Player 2", card.character, card.currentHP, move)}
              selectedMove={
                selectedMoves.find((m) => m.player === "Player 2" && m.moveMaker.character.id === card.character.id)
                  ?.move
              }
              disabled={turn !== "Player 2"}
            />
          ))}
        </div>

        {/* VS Banner */}
        <div className="col-span-3 flex justify-center items-center text-4xl font-bold text-white">VS</div>

        {/* Player 1 Active Cards */}
        <div className="col-span-2 flex justify-center space-x-4">
          {player1Active.map((card) => (
            <BattleCard
              key={getUniqueKey("Player1", card.character.id)}
              character={card.character}
              currentHP={card.currentHP}
              maxHP={card.maxHP}
              selectedMoves={card.character.selectedMoves}
              onMoveSelect={(move) => handleMoveSelect("Player 1", card.character, card.currentHP, move)}
              selectedMove={
                selectedMoves.find((m) => m.player === "Player 1" && m.moveMaker.character.id === card.character.id)
                  ?.move
              }
              disabled={turn !== "Player 1"}
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

      {canConfirm && (
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          onClick={handleConfirm}
        >
          Confirm Moves
        </button>
      )}

      {/* Player 2 Deck Modal */}
      <DeckModal open={player2DeckOpen} onOpenChange={setPlayer2DeckOpen} title="Player 2 Deck" deck={player2Benched} />

      {/* Player 1 Deck Modal */}
      <DeckModal
        open={player1DeckOpen}
        onOpenChange={setPlayer1DeckOpen}
        title="Player 1 Deck"
        deck={player1Benched}
        showSwap
      />

      {/* Target Selection Modal */}
      {targetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg mb-4">
              Select {targetModal.type === "single" ? "1 Target" : "2 Targets"} for {targetModal.move.name}
            </h3>
            <div className="flex space-x-4">
              {battlefieldCards
                .filter((c) => c.character.id !== targetModal.moveMaker.character.id)
                .map((card) => {
                  const selected = tempTargets.find((t) => t.character.id === card.character.id);
                  return (
                    <div
                      key={getUniqueKey("Target", card.character.id)}
                      className={`p-2 rounded-lg cursor-pointer border ${
                        selected ? "border-yellow-400" : "border-transparent"
                      }`}
                      onClick={() => toggleTempTarget(card)}
                    >
                      <img src={card.character.image} alt={card.character.name} className="w-24 h-24 object-cover" />
                      <p className="text-white text-center mt-1">{card.character.name}</p>
                    </div>
                  );
                })}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={tempTargets.length !== (targetModal.type === "single" ? 1 : 2)}
              onClick={handleTargetConfirm}
            >
              Confirm Target
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
