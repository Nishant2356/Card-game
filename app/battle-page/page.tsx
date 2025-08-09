"use client";
import { useState, useEffect, useRef } from "react";
import BattleCard, { Move, Character } from "@/components/BattleCard/page";
import DeckModal from "../modals/DeckModal";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';

type TargetDetails = {
  character: Character;
  player: "Player 1" | "Player 2";
};

type SelectedMove = {
  player: "Player 1" | "Player 2";
  moveMaker: Character;
  targets: TargetDetails[];
  move: Move;
};

type StatEffect = {
  id: string;
  moveDetails: Move;
  affectedStats: { stat: string; amount: number }[];
  duration: number;
  targets: TargetDetails[];
};

interface PartyMember {
  character: Character;
  player: "Player 1" | "Player 2";
}

export default function BattlePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [player1DeckOpen, setPlayer1DeckOpen] = useState(false);
  const [player2DeckOpen, setPlayer2DeckOpen] = useState(false);
  const [player1Deck, setPlayer1Deck] = useState<any[]>([]);
  const [player2Deck, setPlayer2Deck] = useState<any[]>([]);
  const [turn, setTurn] = useState<"Player 1" | "Player 2">("Player 1");
  const [selectedMoves, setSelectedMoves] = useState<SelectedMove[]>([]);
  const [targetModal, setTargetModal] = useState<{
    type: "single" | "double";
    moveMaker: Character;
    move: Move;
    player: "Player 1" | "Player 2";
  } | null>(null);
  const [tempTargets, setTempTargets] = useState<{ character: Character, player: "Player 1" | "Player 2" }[]>([]);
  const [glowingCards, setGlowingCards] = useState<{
    moveMaker: number | null;
    targets: number[];
  }>({ moveMaker: null, targets: [] });
  const [round, setRound] = useState(1);
  const [statEffects, setStatEffects] = useState<StatEffect[]>([]);

  // Helper for unique keys
  const getUniqueKey = (player: string, id: string | number) => `${player}-${id}`;

  useEffect(() => {
    audioRef.current = new Audio('/sounds/background/background_music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const tryAutoplay = async () => {
      try {
        await audioRef.current?.play();
        setIsMusicPlaying(true);
      } catch (err) {
        // console.log("Autoplay prevented - waiting for user interaction");
        setIsMusicPlaying(false);
      }
    };
    tryAutoplay();

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Handle stat effects at the end of each round
  useEffect(() => {
    if (selectedMoves.length > 0 || turn === "Player 2") return;

    const updatedEffects = [...statEffects];
    let updatedPlayer1Deck = [...player1Deck];
    let updatedPlayer2Deck = [...player2Deck];
    let effectsChanged = false;

    // Process each stat effect
    for (let i = updatedEffects.length - 1; i >= 0; i--) {
      const effect = updatedEffects[i];

      // Apply stat changes if duration is still positive
      if (effect.duration > 0) {
        effect.targets.forEach(target => {
          const targetDeck = target.player === "Player 1" ? updatedPlayer1Deck : updatedPlayer2Deck;
          const targetIndex = targetDeck.findIndex(c => c.character.id === target.character.id);

          if (targetIndex !== -1) {
            effect.affectedStats.forEach(statEffect => {
              const currentValue = targetDeck[targetIndex].currentStats[statEffect.stat] || 0;
              targetDeck[targetIndex].currentStats[statEffect.stat] = currentValue + statEffect.amount;
              toast(`${targetDeck[targetIndex].character.name} stat is affected by ${statEffect.stat}`, {
                icon: '⚡',
                style: {
                  background: '#333',
                  color: '#fff',
                },
              });
            });
          }
        });
        effectsChanged = true;
      } else {
        // Remove expired effects
        updatedEffects.splice(i, 1);
        effectsChanged = true;
      }
      effect.duration--;
    }

    if (effectsChanged) {
      setPlayer1Deck(updatedPlayer1Deck);
      setPlayer2Deck(updatedPlayer2Deck);
      setStatEffects(updatedEffects);
    }

  }, [round]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(err => console.error("Error playing music:", err));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

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
              maxHP: fullChar?.stats?.hp || 100,
              currentStats: { ...fullChar?.stats }
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

  const battlefieldCards = [
    ...player1Active.map(c => ({ ...c, player: "Player 1" })),
    ...player2Active.map(c => ({ ...c, player: "Player 2" }))
  ];

  const handleMoveSelect = async (
    player: "Player 1" | "Player 2",
    character: Character,
    hp: number,
    move: Move | null
  ) => {
    setSelectedMoves((prev) => prev.filter((m) => !(m.player === player && m.moveMaker.id === character.id)));
    if (!move) return;

    const fullMove = await fetch(`/api/moveByName?names=${encodeURIComponent(move.name)}`).then((res) => res.json());
    
    if (!fullMove || fullMove.length === 0) return;
    const moveDetails = fullMove[0];

    for (const targetType of moveDetails.targetTypes) {
      if (targetType === "self") {
        const targets = [{ character, player }];
        addMove(player, character, targets, moveDetails);
        return;
      }
      if (targetType === "all") {
        const targets = battlefieldCards
          .filter((c) => c.character.id !== character.id)
          .map((c) => ({
            character: c.character,
            player: c.player
          }));
        addMove(player, character, targets, moveDetails);
        return;
      }
      if (targetType === "single") {
        setTargetModal({ type: "single", moveMaker: character, move: moveDetails, player });
        return;
      }
      if (targetType === "double") {
        setTargetModal({ type: "double", moveMaker: character, move: moveDetails, player });
        return;
      }
    }
  };

  const addMove = (
    player: "Player 1" | "Player 2",
    moveMaker: Character,
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
    addMove(
      targetModal.player,
      targetModal.moveMaker,
      tempTargets,
      targetModal.move
    );
  };

  const toggleTempTarget = (card: any) => {
    setTempTargets((prev) => {
      if (prev.find((t) => t.character.id === card.character.id && t.player === card.player)) {
        return prev.filter((t) => !(t.character.id === card.character.id && t.player === card.player));
      } else {
        if (targetModal?.type === "single") return [{ character: card.character, player: card.player }];
        if (targetModal?.type === "double" && prev.length < 2) return [...prev, { character: card.character, player: card.player }];
        return prev;
      }
    });
  };

  const currentPlayerActive = turn === "Player 1" ? player1Active : player2Active;
  const currentPlayerSelections = selectedMoves.filter((m) => m.player === turn);
  const canConfirm = currentPlayerSelections.length === currentPlayerActive.length;

  const didHit = (accuracy: number) => Math.random() * 100 < accuracy;

  const playMoveSound = (soundPath: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(`/sounds/moves/${soundPath}`);
      audio.onended = () => resolve();
      audio.play();
    });
  };

  const getNextMove = (moves: SelectedMove[], decks: { player1: any[], player2: any[] }) => {
    if (moves.length === 0) return null;

    let fastestMove = moves[0];
    let fastestSpeed = -1;

    for (const move of moves) {
      const deck = move.player === "Player 1" ? decks.player1 : decks.player2;
      const card = deck.find(c => c.character.id === move.moveMaker.id);
      const currentSpeed = card?.currentStats?.speed || 0;

      if (currentSpeed > fastestSpeed) {
        fastestSpeed = currentSpeed;
        fastestMove = move;
      }
    }
    return fastestMove;
  };

  const getPartyMember = (
    move: SelectedMove, 
    decks: { player1: any[], player2: any[] }
  ): PartyMember | null => {
    try {
      const deck = move.player === "Player 1" ? decks.player1 : decks.player2;
      
      // Find first party member who isn't the move maker
      const partyMember = deck.find(c => c.character.id !== move.moveMaker.id);
      
      if (!partyMember) {
        console.warn("No party member found in deck");
        return null;
      }
  
      return {
        character: partyMember.character,
        player: move.player // Same player's deck
      };
    } catch (error) {
      console.error("Error finding party member:", error);
      return null;
    }
  };
  

  const processDamageMoves = async (damageMove: SelectedMove, updatedPlayer1Deck: any[], updatedPlayer2Deck: any[]) => {

    const damage = damageMove.move.power;

    damageMove.targets.forEach((target) => {
      const targetDeck = target.player === "Player 1" ? updatedPlayer1Deck : updatedPlayer2Deck;
      const targetIndex = targetDeck.findIndex(c => c.character.id === target.character.id);

      if (targetIndex !== -1) {
        const currentHP = targetDeck[targetIndex].currentStats.hp;
        const newHP = Math.max(0, currentHP - damage);
        // console.log(
        //   `${damageMove.moveMaker.name} hit ${target.character.name} with ${damageMove.move.name} for ${damage} damage (HP: ${currentHP} → ${newHP})`
        // );

        targetDeck[targetIndex] = {
          ...targetDeck[targetIndex],
          currentStats: {
            ...targetDeck[targetIndex].currentStats,
            hp: newHP
          },
        };
      }
    });
  };

  const processSupportMoves = (
    supportMove: SelectedMove,
    affectedStats: { stat: string; amount: number }[] // Explicit parameter
  ) => {
    if (!affectedStats || !Array.isArray(affectedStats)) return;
  
    const newEffect: StatEffect = {
      id: uuidv4(),
      moveDetails: supportMove.move,
      affectedStats: affectedStats, // Use the passed parameter
      duration: supportMove.move.duration,
      targets: supportMove.targets
    };
  
    setStatEffects(prev => [...prev, newEffect]);
  };

  const processHealMoves = (healMove: SelectedMove, updatedPlayer1Deck: any[], updatedPlayer2Deck: any[]) => {
  const healing = healMove.move.healamount;

  healMove.targets.forEach((target) => {
    const targetDeck = target.player === "Player 1" ? updatedPlayer1Deck : updatedPlayer2Deck;
    const targetIndex = targetDeck.findIndex(c => c.character.id === target.character.id);
    if (targetIndex !== -1) {
      const currentHP = targetDeck[targetIndex].currentStats.hp;
      const newHP = Math.min(100, currentHP + healing);
      console.log(newHP)
      // console.log(
      //   `${damageMove.moveMaker.name} hit ${target.character.name} with ${damageMove.move.name} for ${damage} damage (HP: ${currentHP} → ${newHP})`
      // );

      targetDeck[targetIndex] = {
        ...targetDeck[targetIndex],
        currentStats: {
          ...targetDeck[targetIndex].currentStats,
          hp: newHP
        },
      };
  }
  });
};

  const processTargetMoves = async ( targetMove: SelectedMove, updatedPlayer1Deck: any[], updatedPlayer2Deck: any[]) => {
    const roles = targetMove.move.roles
    for (const role of roles) {
      if (role === "damage") {
        await processDamageMoves(targetMove, updatedPlayer1Deck, updatedPlayer2Deck);
      } else if (role === "support") {
        processSupportMoves(targetMove, targetMove.move.affectedStats);
      } else if (role === "selfheal") {
        const newTargetMove = targetMove;
        newTargetMove.targets = [{character: targetMove.moveMaker, player: targetMove.player}]
        processHealMoves(newTargetMove, updatedPlayer1Deck, updatedPlayer2Deck);
      } else if (role === "healpartymember") {
        const currentDecks = {
          player1: updatedPlayer1Deck,
          player2: updatedPlayer2Deck
        };
      
        // Get party member (with proper null checking)
        const partyMember = getPartyMember(targetMove, currentDecks);
        
        if (!partyMember) {
          console.warn("No party member found to heal");
          continue; // Exit if no valid target
        }
      
        // Create new target move with the party member as target
        const healingMove = {
          ...targetMove,
          targets: [{
            character: partyMember.character,
            player: partyMember.player
          }]
        };
      
        // Process the healing
        processHealMoves(healingMove, updatedPlayer1Deck, updatedPlayer2Deck);
        
        // Visual feedback
        toast.success(`${targetMove.moveMaker.name} healed ${partyMember.character.name}!`);
      } else if (role === "selfsupport") {
        const selfSupportMove = {
          ...targetMove,
          targets: [{
            character: targetMove.moveMaker,
            player: targetMove.player
          }]
        };
        processSupportMoves(selfSupportMove, selfSupportMove.move.affectedStats2);
      } else if (role === "supportpartymember") {
        const currentDecks = {
          player1: player1Active,
          player2: player2Active
        };
      
        const partyMember = getPartyMember(targetMove, currentDecks);
        
        if (!partyMember) {
          console.warn("No party member found to heal");
          continue;
        }
      
        const partySupportMove = {
          ...targetMove,
          targets: [{
            character: partyMember.character,
            player: partyMember.player
          }]
        };
      
        processSupportMoves(partySupportMove, targetMove.move.affectedStats2);
      }
    }
  };

  const processMoves = async (initialMoves: SelectedMove[]) => {
    let remainingMoves = [...initialMoves];
    let updatedPlayer1Deck = [...player1Deck];
    let updatedPlayer2Deck = [...player2Deck];

    console.log("All moves to execute:", remainingMoves);

    await new Promise((res) => setTimeout(res, 1000));

    while (remainingMoves.length > 0) {
      const currentDecks = {
        player1: updatedPlayer1Deck,
        player2: updatedPlayer2Deck
      };

      const nextMove = getNextMove(remainingMoves, currentDecks);
      if (!nextMove) break;

      remainingMoves = remainingMoves.filter(m =>
        !(m.player === nextMove.player &&
          m.moveMaker.id === nextMove.moveMaker.id &&
          m.move.name === nextMove.move.name)
      );

      const { move, moveMaker, targets, player: moveMakerPlayer } = nextMove;

      setGlowingCards({
        moveMaker: moveMaker.id,
        targets: targets.map(t => t.character.id)
      });

      toast(`${moveMaker.name} used ${move.name}`, {
        icon: '⚡',
        style: {
          background: '#333',
          color: '#fff',
        },
      });

      if (move.moveSound) {
        await playMoveSound(move.moveSound);
      }

      if (!didHit(move.accuracy)) {
        // console.log(`${damageMove.move.name} MISSED!`);
        await new Promise((res) => setTimeout(res, 1000));
        setGlowingCards({ moveMaker: null, targets: [] });
        continue;
      }

      // Process move based on categories
      for (const category of move.categories) {
        if (category === "target") {
          await processTargetMoves(nextMove, updatedPlayer1Deck, updatedPlayer2Deck);
          break; // Only process the first matching category
        }
        // Add other category handlers here when needed
      }

      setPlayer1Deck([...updatedPlayer1Deck]);
      setPlayer2Deck([...updatedPlayer2Deck]);
      await new Promise((res) => setTimeout(res, 0));

      setGlowingCards({ moveMaker: null, targets: [] });
      await new Promise((res) => setTimeout(res, 1000));
    }

    setRound(prev => prev + 1)
    console.log(player1Deck)
    console.log(player2Deck)
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (turn === "Player 1") {
      setTurn("Player 2");
    } else {
      // console.log("Confirmed moves before execution:", selectedMoves);
      processMoves(selectedMoves);
      setTurn("Player 1");
      setSelectedMoves([]);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <button
        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
        onClick={toggleMusic}
      >
        <span>{isMusicPlaying ? "🔊" : "🔇"}</span>
        {isMusicPlaying ? "Music ON" : "Music OFF"}
      </button>
      <Toaster position="top-center" />
      <h2 className="text-white text-xl mb-4">{turn}'s Turn (Round {round})</h2>
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
              currentHP={card.currentStats.hp}
              maxHP={card.maxHP}
              currentStats={card.currentStats}
              selectedMoves={card.character.selectedMoves}
              onMoveSelect={(move) => handleMoveSelect("Player 2", card.character, card.currentStats.hp, move)}
              selectedMove={
                selectedMoves.find((m) => m.player === "Player 2" && m.moveMaker.id === card.character.id)
                  ?.move
              }
              disabled={turn !== "Player 2"}
              isGlowing={glowingCards.moveMaker === card.character.id}
              isTargetGlowing={glowingCards.targets.includes(card.character.id)}
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
              currentHP={card.currentStats.hp}
              maxHP={card.maxHP}
              currentStats={card.currentStats}
              selectedMoves={card.character.selectedMoves}
              onMoveSelect={(move) => handleMoveSelect("Player 1", card.character, card.currentHP, move)}
              selectedMove={
                selectedMoves.find((m) => m.player === "Player 1" && m.moveMaker.id === card.character.id)
                  ?.move
              }
              disabled={turn !== "Player 1"}
              isGlowing={glowingCards.moveMaker === card.character.id}
              isTargetGlowing={glowingCards.targets.includes(card.character.id)}
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
      <DeckModal open={player2DeckOpen} onOpenChange={setPlayer2DeckOpen} title="Player 2 Deck" deck={player2Benched} showSwap />

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
                .filter((c) => c.character.id !== targetModal.moveMaker.id)
                .map((card) => {
                  const selected = tempTargets.find((t) =>
                    t.character.id === card.character.id && t.player === card.player
                  );
                  return (
                    <div
                      key={getUniqueKey("Target", `${card.player}-${card.character.id}`)}
                      className={`p-2 rounded-lg cursor-pointer border ${selected ? "border-yellow-400" : "border-transparent"
                        }`}
                      onClick={() => toggleTempTarget(card)}
                    >
                      <img src={card.character.image} alt={card.character.name} className="w-24 h-24 object-cover" />
                      <p className="text-white text-center mt-1">{card.character.name} ({card.player})</p>
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