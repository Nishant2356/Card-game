"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import BattleCard, { Move, Character } from "@/components/BattleCard/page";
import DeckModal from "../modals/DeckModal";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";

type TargetDetails = {
  deckid: string;
  character: Character;
  player: "Player 1" | "Player 2";
  targetIndex: number; // index of the active slot at selection time (0..)
};

type SelectedMove = {
  deckid: string; // deckid of the move maker card
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
  const [faintedPlayer1, setFaintedPlayer1] = useState<{ [key: string]: boolean }>({});
  const [faintedPlayer2, setFaintedPlayer2] = useState<{ [key: string]: boolean }>({});
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [allMoveDetails, setAllMoveDetails] = useState<any[]>([]);


  const router = useRouter();
  // derive counts from decks
  const activePlayer1Count = useMemo(
    () => player1Deck.filter(c => (c.currentStats?.hp ?? 0) > 0).length,
    [player1Deck]
  );
  const activePlayer2Count = useMemo(
    () => player2Deck.filter(c => (c.currentStats?.hp ?? 0) > 0).length,
    [player2Deck]
  );

  const [turn, setTurn] = useState<"Player 1" | "Player 2">("Player 1");
  const [selectedMoves, setSelectedMoves] = useState<SelectedMove[]>([]);
  const [targetModal, setTargetModal] = useState<{
    type: "single" | "double";
    deckid: string; // deckid of the move maker
    moveMaker: Character;
    move: Move;
    player: "Player 1" | "Player 2";
  } | null>(null);
  // tempTargets now include deckid and targetIndex
  const [tempTargets, setTempTargets] = useState<TargetDetails[]>([]);
  const [glowingCards, setGlowingCards] = useState<{ moveMaker: string | null; targets: string[] }>({ moveMaker: null, targets: [] });
  const [round, setRound] = useState(1);
  const [statEffects, setStatEffects] = useState<StatEffect[]>([]);

  // --- New state for swap-selection modal ---
  const [swapSelectorOpen, setSwapSelectorOpen] = useState(false);
  const [pendingSwap, setPendingSwap] = useState<{ benchIndex: number; swapPlayer: string } | null>(null);
  const [selectedActiveIndexForSwap, setSelectedActiveIndexForSwap] = useState<number | null>(null);
  const [pendingToastMessage, setPendingToastMessage] = useState<string | null>(null);
  // ------------------------------------------------

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
        setIsMusicPlaying(false);
      }
    };
    tryAutoplay();

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Close deck modal and open swap selector when pendingSwap is set.
  useEffect(() => {
    if (!pendingSwap) return;

    const isPlayer1 = pendingSwap.swapPlayer.toLowerCase().includes("player 1");
    if (isPlayer1) setPlayer1DeckOpen(false);
    else setPlayer2DeckOpen(false);

    const t = setTimeout(() => setSwapSelectorOpen(true), 0);
    return () => clearTimeout(t);
  }, [pendingSwap]);

  // Effect to safely show toast messages (prevents toast being called during render)
  useEffect(() => {
    if (!pendingToastMessage) return;
    toast(pendingToastMessage, {
      icon: '⚡',
      style: {
        background: '#111827',
        color: '#fff',
      },
    });
    setPendingToastMessage(null);
  }, [pendingToastMessage]);

  // Handle stat effects at the end of each round
  useEffect(() => {
    if (selectedMoves.length > 0 || turn === "Player 2") return;

    const updatedEffects = [...statEffects];
    let updatedPlayer1Deck = [...player1Deck];
    let updatedPlayer2Deck = [...player2Deck];
    let effectsChanged = false;

    for (let i = updatedEffects.length - 1; i >= 0; i--) {
      const effect = updatedEffects[i];

      if (effect.duration > 0) {
        effect.targets.forEach(target => {
          const targetDeck = target.player === "Player 1" ? updatedPlayer1Deck : updatedPlayer2Deck;
          const targetIndex = targetDeck.findIndex(c => c.deckid === target.deckid);

          if (targetIndex !== -1) {
            effect.affectedStats.forEach(statEffect => {
              const currentValue = targetDeck[targetIndex].currentStats[statEffect.stat] || 0;
              targetDeck[targetIndex].currentStats[statEffect.stat] = currentValue + statEffect.amount;
              toast(`${targetDeck[targetIndex].character.name} stat is affected by ${statEffect.stat}`, {
                icon: '⚡',
                style: {
                  background: '#111827',
                  color: '#fff',
                },
              });
            });
          }
        });
        effectsChanged = true;
      } else {
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
  
    const allCharNames = teams.flatMap((team: any) =>
      team.characters.map((char: any) => char.name)
    );
  
    if (allCharNames.length === 0) return;
  
    // First, fetch character details
    fetch(`/api/characterByName?names=${encodeURIComponent(allCharNames.join(","))}`)
      .then((res) => res.json())
      .then((characterData) => {
        const mapDeck = (team: any) =>
          team.characters.map((char: any) => {
            const fullChar = characterData.find((c: any) => c.name === char.name);
            return {
              deckid: uuidv4(),
              player: team.player,
              character: { ...fullChar, selectedMoves: char.moves },
              maxHP: fullChar?.stats?.hp || 100,
              currentStats: { ...fullChar?.stats }
            };
          });
  
        setPlayer1Deck(mapDeck(teams.find((t: any) => t.player === "Player 1")));
        setPlayer2Deck(mapDeck(teams.find((t: any) => t.player === "Player 2")));
        setTeamsLoaded(true);
  
        // 🔹 Gather all unique move names from BOTH teams
        const allMoveNames = [
          ...new Set(
            teams.flatMap((team: any) =>
              team.characters.flatMap((char: any) => char.moves.map((m: any) => m.name))
            )
          )
        ];
  
        // 🔹 Fetch move details once
        fetch(`/api/moveByName?names=${encodeURIComponent(allMoveNames.join(","))}`)
          .then((res) => res.json())
          .then((moveData) => {
            setAllMoveDetails(moveData);
          });
      });
  }, []);
  

  const player1Active = player1Deck.slice(0, 2);
  const player1Benched = player1Deck.slice(2);
  const player2Active = player2Deck.slice(0, 2);
  const player2Benched = player2Deck.slice(2);

  // helper
  const buildFaintMapFromDeck = (deck: any[]) => {
    const map: { [key: string]: boolean } = {};
    deck.forEach(c => {
      map[c.deckid] = !!(c.currentStats?.hp <= 0); // true if hp <= 0, else false
    });
    return map;
  };

  const shallowEqual = (a: { [k: string]: any } = {}, b: { [k: string]: any } = {}) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(k => a[k] === b[k]);
  };

  // init/update when player decks change
  useEffect(() => {
    if (!player1Deck || player1Deck.length === 0) return;
    setFaintedPlayer1(prev => {
      const next = buildFaintMapFromDeck(player1Deck);
      return shallowEqual(prev, next) ? prev : next;
    });
  }, [player1Deck]);

  useEffect(() => {
    if (!player2Deck || player2Deck.length === 0) return;
    setFaintedPlayer2(prev => {
      const next = buildFaintMapFromDeck(player2Deck);
      return shallowEqual(prev, next) ? prev : next;
    });
  }, [player2Deck]);

  // Build battlefieldCards with activeIndex so we can store/resolve slots
  const battlefieldCards = [
    ...player1Active.map((c, i) => ({ ...c, player: "Player 1" as const, activeIndex: i })),
    ...player2Active.map((c, i) => ({ ...c, player: "Player 2" as const, activeIndex: i })),
  ];

  const handleMoveSelect = async (
    deckid: string,
    player: "Player 1" | "Player 2",
    character: Character,
    hp: number,
    move: Move | null
  ) => {
    // remove any prior selection for this card (by deckid)
    setSelectedMoves((prev) => prev.filter((m) => !(m.player === player && m.deckid === deckid)));
    if (!move) return;

    const moveDetails = allMoveDetails.find((m) => m.name === move.name);
    console.log(moveDetails)
    if (!moveDetails) return;
    

    for (const targetType of moveDetails.targetTypes) {
      if (targetType === "self") {
        const charDeck = player === "Player 1" ? player1Active : player2Active;
        const targetIndex = Math.max(0, charDeck.findIndex((c) => c.deckid === deckid));
        const targets: TargetDetails[] = [{ deckid, character, player, targetIndex }];
        addMove(deckid, player, character, targets, moveDetails);
        return;
      }
      if (targetType === "all") {
        const targets: TargetDetails[] = battlefieldCards
          .filter((c) => c.deckid !== deckid)
          .map((c) => ({
            deckid: c.deckid,
            character: c.character,
            player: c.player,
            targetIndex: (c as any).activeIndex as number
          }));
        addMove(deckid, player, character, targets, moveDetails);
        return;
      }
      if (targetType === "single") {
        setTargetModal({ type: "single", deckid, moveMaker: character, move: moveDetails, player });
        return;
      }
      if (targetType === "double") {
        setTargetModal({ type: "double", deckid, moveMaker: character, move: moveDetails, player });
        return;
      }
    }
  };

  const checkFaint = (target: TargetDetails) => {
    const isPlayer1 = target.player === "Player 1";
    const targetDeck = isPlayer1 ? player1Deck : player2Deck;
    const setFainted = isPlayer1 ? setFaintedPlayer1 : setFaintedPlayer2;

    const targetIndex = targetDeck.findIndex(c => c.deckid === target.deckid);
    if (targetIndex === -1) return; // not found

    const deckid = targetDeck[targetIndex].deckid;
    const hp = targetDeck[targetIndex].currentStats.hp;

    if (hp <= 0) {
      // Update fainted map immutably
      setFainted(prev => ({
        ...prev,
        [deckid]: true
      }));
    }
  };

  useEffect(() => {
    // don't check until we actually loaded decks
    if (!teamsLoaded) return;

    if (activePlayer1Count === 0 && activePlayer2Count === 0) {
      router.push("/winner-page")
    } else if (activePlayer1Count === 0) {
      router.push("/winner-page")
    } else if (activePlayer2Count === 0) {
      router.push("/winner-page")
    }
  }, [activePlayer1Count, activePlayer2Count, teamsLoaded]);
  const addMove = (
    deckid: string,
    player: "Player 1" | "Player 2",
    moveMaker: Character,
    targets: TargetDetails[],
    move: Move
  ) => {
    setSelectedMoves((prev) => [...prev, { deckid, player, moveMaker, targets, move }]);
    setTargetModal(null);
    setTempTargets([]);
  };

  const handleTargetConfirm = () => {
    if (!targetModal) return;
    const required = targetModal.type === "single" ? 1 : 2;
    if (tempTargets.length !== required) return;
    addMove(
      targetModal.deckid,
      targetModal.player,
      targetModal.moveMaker,
      tempTargets,
      targetModal.move
    );
  };

  // toggleTempTarget now captures the activeIndex so we can resolve slot later
  const toggleTempTarget = (card: any) => {
    setTempTargets((prev) => {
      const found = prev.find((t) => t.player === card.player && t.targetIndex === card.activeIndex && t.deckid === card.deckid);
      if (found) {
        return prev.filter((t) => !(t.player === card.player && t.targetIndex === card.activeIndex && t.deckid === card.deckid));
      } else {
        if (targetModal?.type === "single") return [{ deckid: card.deckid, character: card.character, player: card.player, targetIndex: card.activeIndex }];
        if (targetModal?.type === "double" && prev.length < 2) return [...prev, { deckid: card.deckid, character: card.character, player: card.player, targetIndex: card.activeIndex }];
        return prev;
      }
    });
  };

  const currentPlayerActive = turn === "Player 1" ? player1Active : player2Active;
  const currentPlayerSelections = selectedMoves.filter((m) => m.player === turn);
  // const canConfirm = currentPlayerSelections.length === currentPlayerActive.length;

  const didHit = (accuracy: number) => Math.random() * 100 < accuracy;

  const playMoveSound = (soundPath: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(`/sounds/moves/${soundPath}`);
      audio.onended = () => resolve();
      audio.play().catch(() => resolve());
    });
  };

  const getNextMove = (moves: SelectedMove[], decks: { player1: any[], player2: any[] }) => {
    if (moves.length === 0) return null;

    let fastestMove = moves[0];
    let fastestSpeed = -1;

    for (const move of moves) {
      const deck = move.player === "Player 1" ? decks.player1 : decks.player2;
      const card = deck.find(c => c.deckid === move.deckid);
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

      // choose the other active card by deckid difference
      const partyMember = deck.find(c => c.deckid !== move.deckid);

      if (!partyMember) {
        console.warn("No party member found in deck");
        return null;
      }

      return {
        character: partyMember.character,
        player: move.player
      };
    } catch (error) {
      console.error("Error finding party member:", error);
      return null;
    }
  };

  // Swap method: opens a modal that asks which active card to swap with.
  const swapMethod = (benchIndex: number, swapPlayer: string): void => {
    setPendingSwap({ benchIndex, swapPlayer });
    setSelectedActiveIndexForSwap(null);
  };

  const confirmSwap = () => {
    if (!pendingSwap || selectedActiveIndexForSwap === null) return;

    const { benchIndex, swapPlayer } = pendingSwap;
    const isPlayer1 = swapPlayer.toLowerCase().includes("player 1");

    if (isPlayer1) {
      const prev = player1Deck;
      const active = prev.slice(0, 2);
      const benched = prev.slice(2);

      if (benched.length === 0) {
        setSwapSelectorOpen(false);
        setPendingSwap(null);
        setSelectedActiveIndexForSwap(null);
        return;
      }

      const bIndex = Math.max(0, Math.min(benchIndex, benched.length - 1));
      const aIndex = Math.max(0, Math.min(selectedActiveIndexForSwap, active.length - 1));

      const newActive = [...active];
      const newBenched = [...benched];

      const benchCard = newBenched[bIndex];
      const activeCard = newActive[aIndex];

      newActive[aIndex] = benchCard;
      newBenched[bIndex] = activeCard;

      const newDeck = [...newActive, ...newBenched];

      setPlayer1Deck(newDeck);

      setPendingToastMessage(`${benchCard.character.name} swapped into active!`);

      setSwapSelectorOpen(false);
      setPendingSwap(null);
      setSelectedActiveIndexForSwap(null);
    } else {
      const prev = player2Deck;
      const active = prev.slice(0, 2);
      const benched = prev.slice(2);

      if (benched.length === 0) {
        setSwapSelectorOpen(false);
        setPendingSwap(null);
        setSelectedActiveIndexForSwap(null);
        return;
      }

      const bIndex = Math.max(0, Math.min(benchIndex, benched.length - 1));
      const aIndex = Math.max(0, Math.min(selectedActiveIndexForSwap, active.length - 1));

      const newActive = [...active];
      const newBenched = [...benched];

      const benchCard = newBenched[bIndex];
      const activeCard = newActive[aIndex];

      newActive[aIndex] = benchCard;
      newBenched[bIndex] = activeCard;

      const newDeck = [...newActive, ...newBenched];

      setPlayer2Deck(newDeck);

      setPendingToastMessage(`${benchCard.character.name} swapped into active!`);

      setSwapSelectorOpen(false);
      setPendingSwap(null);
      setSelectedActiveIndexForSwap(null);
    }
  };

  const cancelSwap = () => {
    setSwapSelectorOpen(false);
    setPendingSwap(null);
    setSelectedActiveIndexForSwap(null);
  };

  const processDamageMoves = async (damageMove: SelectedMove, updatedPlayer1Deck: any[], updatedPlayer2Deck: any[]) => {
    const damage = damageMove.move.power || 0;

    for (const target of damageMove.targets) {
      const targetDeck = target.player === "Player 1" ? updatedPlayer1Deck : updatedPlayer2Deck;

      // Prefer resolving by stored slot index (targetIndex = active slot (0..)).
      const activeCount = Math.min(2, targetDeck.length);
      let deckIndex: number = -1;

      if (typeof target.targetIndex === "number" && target.targetIndex >= 0 && target.targetIndex < activeCount) {
        // resolve to whoever currently occupies that active slot
        deckIndex = target.targetIndex;
      } else {
        // fallback: try find by deckid (targeting the card specifically)
        deckIndex = targetDeck.findIndex(c => c.deckid === target.deckid);
      }

      // ultimate fallback: find by character id
      if (deckIndex === -1) {
        deckIndex = targetDeck.findIndex(c => c.character.id === target.character.id);
      }

      if (deckIndex !== -1 && targetDeck[deckIndex]) {
        const currentHP = targetDeck[deckIndex].currentStats.hp;
        const newHP = Math.max(0, currentHP - damage);

        targetDeck[deckIndex] = {
          ...targetDeck[deckIndex],
          currentStats: {
            ...targetDeck[deckIndex].currentStats,
            hp: newHP
          },
        };
      }
    }
  };

  const processSupportMoves = (
    supportMove: SelectedMove,
    affectedStats: { stat: string; amount: number }[] // Explicit parameter
  ) => {
    if (!affectedStats || !Array.isArray(affectedStats)) return;

    const newEffect: StatEffect = {
      id: uuidv4(),
      moveDetails: supportMove.move,
      affectedStats: affectedStats,
      duration: supportMove.move.duration,
      targets: supportMove.targets
    };

    setStatEffects(prev => [...prev, newEffect]);
  };

  const processHealMoves = (healMove: SelectedMove, updatedPlayer1Deck: any[], updatedPlayer2Deck: any[]) => {
    const healing = healMove.move.healamount || 0;

    for (const target of healMove.targets) {
      const targetDeck = target.player === "Player 1" ? updatedPlayer1Deck : updatedPlayer2Deck;

      const activeCount = Math.min(2, targetDeck.length);
      let deckIndex: number = -1;
      if (typeof target.targetIndex === "number" && target.targetIndex >= 0 && target.targetIndex < activeCount) {
        deckIndex = target.targetIndex;
      } else {
        deckIndex = targetDeck.findIndex(c => c.deckid === target.deckid);
      }

      if (deckIndex === -1) {
        deckIndex = targetDeck.findIndex(c => c.character.id === target.character.id);
      }

      if (deckIndex !== -1 && targetDeck[deckIndex]) {
        const currentHP = targetDeck[deckIndex].currentStats.hp;
        const maxHP = targetDeck[deckIndex].maxHP || 100;
        const newHP = Math.min(maxHP, currentHP + healing);

        targetDeck[deckIndex] = {
          ...targetDeck[deckIndex],
          currentStats: {
            ...targetDeck[deckIndex].currentStats,
            hp: newHP
          },
        };
      }
    }
  };

  const processTargetMoves = async (targetMove: SelectedMove, updatedPlayer1Deck: any[], updatedPlayer2Deck: any[]) => {
    const roles = targetMove.move.roles || [];
    for (const role of roles) {
      if (role === "damage") {
        await processDamageMoves(targetMove, updatedPlayer1Deck, updatedPlayer2Deck);
      } else if (role === "support") {
        processSupportMoves(targetMove, targetMove.move.affectedStats || []);
      } else if (role === "selfheal") {
        const newTargetMove = { ...targetMove };
        newTargetMove.targets = [{ deckid: targetMove.deckid, character: targetMove.moveMaker, player: targetMove.player, targetIndex: 0 }];
        processHealMoves(newTargetMove, updatedPlayer1Deck, updatedPlayer2Deck);
      } else if (role === "healpartymember") {
        const currentDecks = {
          player1: updatedPlayer1Deck,
          player2: updatedPlayer2Deck
        };

        const partyMember = getPartyMember(targetMove, currentDecks);

        if (!partyMember) {
          console.warn("No party member found to heal");
          continue;
        }

        const healingMove = {
          ...targetMove,
          targets: [{
            deckid: (currentDecks as any)[partyMember.player === "Player 1" ? "player1" : "player2"].find((c: any) => c.character.id === partyMember.character.id)?.deckid ?? "",
            character: partyMember.character,
            player: partyMember.player,
            targetIndex: 1 // best-effort; party member slot resolution will occur in processHealMoves
          }]
        };

        processHealMoves(healingMove, updatedPlayer1Deck, updatedPlayer2Deck);

        toast.success(`${targetMove.moveMaker.name} healed ${partyMember.character.name}!`);
      } else if (role === "selfsupport") {
        const selfSupportMove = {
          ...targetMove,
          targets: [{
            deckid: targetMove.deckid,
            character: targetMove.moveMaker,
            player: targetMove.player,
            targetIndex: 0
          }]
        };
        processSupportMoves(selfSupportMove, selfSupportMove.move.affectedStats2 || []);
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
            deckid: (partyMember.player === "Player 1" ? player1Active : player2Active).find((c: any) => c.character.id === partyMember.character.id)?.deckid ?? "",
            character: partyMember.character,
            player: partyMember.player,
            targetIndex: 1
          }]
        };

        processSupportMoves(partySupportMove, targetMove.move.affectedStats2 || []);
      }
    }
  };

  const processMoves = async (initialMoves: SelectedMove[]) => {
    let remainingMoves = [...initialMoves];
    let updatedPlayer1Deck = [...player1Deck];
    let updatedPlayer2Deck = [...player2Deck];

    console.log("All moves to execute:", battlefieldCards);
    console.log("avtivecards:", player1Active);

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
          m.deckid === nextMove.deckid &&
          m.move.name === nextMove.move.name)
      );

      const { deckid, move, moveMaker, targets, player: moveMakerPlayer } = nextMove;
      // check the authoritative local decks updated in this function
      const makerLocalDeck = moveMakerPlayer === "Player 1" ? updatedPlayer1Deck : updatedPlayer2Deck;
      const makerIndex = makerLocalDeck.findIndex(c => c.deckid === deckid);
      
      // if not found or HP <= 0, skip this action
      if (makerIndex === -1 || (makerLocalDeck[makerIndex].currentStats?.hp ?? 0) <= 0) {
        continue;
      }

      // Resolve targets by slot (targetIndex). If a different character is now at that slot, they are hit.
      const resolvedTargets: TargetDetails[] = targets.map((target) => {
        const isP1 = target.player === "Player 1";
        const activeArr = isP1 ? updatedPlayer1Deck.slice(0, 2) : updatedPlayer2Deck.slice(0, 2);
        let resolvedSlot = -1;

        if (typeof target.targetIndex === "number" && target.targetIndex >= 0 && target.targetIndex < activeArr.length) {
          resolvedSlot = target.targetIndex;
        } else {
          // fallback: find by deckid in current activeArr
          resolvedSlot = activeArr.findIndex((c) => c.deckid === target.deckid);
        }

        // If resolvedSlot is still -1, fallback to searching whole deck
        if (resolvedSlot === -1) {
          const wholeDeck = isP1 ? updatedPlayer1Deck : updatedPlayer2Deck;
          const idx = wholeDeck.findIndex(c => c.deckid === target.deckid);
          if (idx !== -1) {
            return { deckid: wholeDeck[idx].deckid, character: wholeDeck[idx].character, player: target.player, targetIndex: idx };
          } else {
            // ultimate fallback: keep original target but keep deckid (processDamageMoves will try by deckid)
            return { ...target };
          }
        }

        const wholeDeck = isP1 ? updatedPlayer1Deck : updatedPlayer2Deck;
        const deckIndex = resolvedSlot;
        const resolvedCharacter = wholeDeck[deckIndex]?.character ?? target.character;
        const resolvedDeckid = wholeDeck[deckIndex]?.deckid ?? target.deckid;

        return { deckid: resolvedDeckid, character: resolvedCharacter, player: target.player, targetIndex: deckIndex };
      });

      setGlowingCards({
        moveMaker: nextMove.deckid,
        targets: resolvedTargets.map(t => t.deckid)
      });

      toast(`${moveMaker.name} used ${move.name}`, {
        icon: '⚡',
        style: {
          background: '#111827',
          color: '#fff',
        },
      });

      if (move.moveSound) {
        await playMoveSound(move.moveSound);
      }

      if (!didHit(move.accuracy)) {
        await new Promise((res) => setTimeout(res, 1000));
        setGlowingCards({ moveMaker: null, targets: [] });
        continue;
      }

      // Use resolvedTargets in a clone of nextMove so processing uses the slot-resolved targets
      const moveToProcess: SelectedMove = { ...nextMove, targets: resolvedTargets };

      for (const category of move.categories) {
        if (category === "target") {
          await processTargetMoves(moveToProcess, updatedPlayer1Deck, updatedPlayer2Deck);
          break;
        }
      }

      setPlayer1Deck([...updatedPlayer1Deck]);
      setPlayer2Deck([...updatedPlayer2Deck]);
      await new Promise((res) => setTimeout(res, 0));

      setGlowingCards({ moveMaker: null, targets: [] });
      await new Promise((res) => setTimeout(res, 1000));
    }

    setRound(prev => prev + 1);
    console.log(player1Deck);
    console.log(player2Deck);
  };

  const handleConfirm = () => {
    if (turn === "Player 1") {
      setTurn("Player 2");
    } else {
      processMoves(selectedMoves);
      setTurn("Player 1");
      setSelectedMoves([]);
    }
  };

  // ---------- Presentational helpers (pure, do not change state) ----------
  const renderPlayerPanel = (playerLabel: "Player 1" | "Player 2", active: any[], benched: any[], openDeck: () => void) => {
    const isCurrent = turn === playerLabel;
    const borderColor = isCurrent ? "border-yellow-400" : "border-gray-700";
    return (
      <div className={`flex flex-col items-center w-full max-w-xs`}>
        <div className={`w-full flex items-center justify-between bg-gradient-to-r ${playerLabel === "Player 1" ? "from-indigo-900 to-indigo-700" : "from-rose-900 to-rose-700"} p-3 rounded-xl shadow-2xl ring-1 ring-black/60 border ${borderColor}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black/40 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
              {/* player avatar placeholder */}
              <span className="text-sm uppercase font-bold text-white/90">{playerLabel.split(" ")[1]}</span>
            </div>
            <div>
              <div className="text-white font-bold">{playerLabel}</div>
              <div className="text-xs text-white/70">{isCurrent ? "Active" : "Waiting"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/80 mr-2">Round {round}</div>
            <button
              onClick={openDeck}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" /></svg>
              Deck
            </button>
          </div>
        </div>

        <div className="mt-3 w-full bg-gradient-to-b from-black/40 to-white/2 p-3 rounded-xl border border-white/5 shadow-inner">
          <div className="flex gap-3 justify-center">
            {active.length === 0 ? (
              <div className="text-white/60">No active characters</div>
            ) : (
              active.map((card: any) => (
                <div key={getUniqueKey(`${playerLabel}-active`, card.deckid)} className="w-36">
                  <div className={`relative rounded-lg overflow-hidden p-1 bg-black/20 border ${glowingCards.moveMaker === card.deckid ? "ring-4 ring-yellow-400/30" : "ring-1 ring-black/50"}`}>
                    <img src={card.character.image} alt={card.character.name} className="w-full h-28 object-cover rounded-md" />
                    <div className="mt-2">
                      <div className="text-sm text-white font-semibold truncate">{card.character.name}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="text-xs text-white/70">HP</div>
                        <div className="text-sm text-white font-bold">{Math.max(0, card.currentStats.hp)}</div>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${Math.max(0, (card.currentStats.hp / (card.maxHP || 100)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {benched.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto py-2">
              {benched.map((b: any, i: number) => (
                <div key={getUniqueKey(`${playerLabel}-bench`, b.deckid)} className="w-20 flex-shrink-0 text-center">
                  <img src={b.character.image} alt={b.character.name} className="w-16 h-16 rounded-md object-cover border border-white/5" />
                  <div className="text-xs text-white/70 mt-1 truncate">{b.character.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  // ---------- end helpers ----------

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-b from-neutral-900 via-slate-900 to-black relative overflow-hidden">
      {/* subtle decorative background shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-700/30 to-transparent blur-3xl opacity-60" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-gradient-to-br from-rose-700/25 to-transparent blur-3xl opacity-60" />
      </div>

      {/* Top header */}
      <header className="w-full max-w-6xl mx-auto mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center shadow-xl">
              <span className="text-xl font-extrabold">⚔️</span>
            </div>
            <div>
              <h1 className="text-2xl text-white font-extrabold">Anime Clash</h1>
              <p className="text-sm text-white/70">Multiverse Arena — pick your heroes & duel!</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-white/80 mr-2">Turn</div>
          <div className="px-3 py-2 bg-gradient-to-r from-black/50 to-white/2 rounded-lg border border-white/5">
            <div className="text-sm text-white font-semibold">{turn}</div>
            <div className="text-xs text-white/50">Round {round}</div>
          </div>

          <button
            onClick={toggleMusic}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-white"
            title="Toggle music"
          >
            <span className="text-lg">{isMusicPlaying ? "🔊" : "🔇"}</span>
            <span className="text-sm">{isMusicPlaying ? "Music ON" : "Music OFF"}</span>
          </button>
        </div>
      </header>

      {/* Main Arena */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-12 gap-6">
        {/* Left - Player 2 panel (top-left) */}
        <div className="col-span-3 flex flex-col items-center gap-4">
          {renderPlayerPanel("Player 2", player2Active, player2Benched, () => setPlayer2DeckOpen(true))}
        </div>

        {/* Center - Battlefield */}
        <div className="col-span-6 flex flex-col items-center">
          <div className="w-full bg-gradient-to-b from-black/60 to-white/2 p-6 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white font-bold text-lg">Battlefield</div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-white/60">Active Fighters</div>
                <div className="text-sm text-white/80 px-3 py-1 rounded bg-black/30">{player1Active.length + player2Active.length}</div>
              </div>
            </div>

            <div className="w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black via-slate-900 to-zinc-900 p-6 rounded-xl border border-white/3 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('/images/arena-pattern.png')] bg-center bg-cover" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Opponent active (Player2) */}
                <div className="flex gap-6 justify-center w-full">
                  {player2Active.length === 0 ? (
                    <div className="text-white/60">No fighters</div>
                  ) : player2Active.map((card, idx) => (
                    <div key={getUniqueKey("Player2", card.deckid)} className={`transform transition duration-300 ${glowingCards.moveMaker === card.deckid ? "scale-105" : ""}`}>
                      <div className="w-44">
                        <BattleCard
                          character={card.character}
                          currentHP={card.currentStats.hp}
                          maxHP={card.maxHP}
                          currentStats={card.currentStats}
                          selectedMoves={card.character.selectedMoves}
                          onMoveSelect={(move) => handleMoveSelect(card.deckid, "Player 2", card.character, card.currentStats.hp, move)}
                          selectedMove={selectedMoves.find((m) => m.player === "Player 2" && m.deckid === card.deckid)?.move}
                          disabled={turn !== "Player 2" || faintedPlayer2[card.deckid]}
                          isGlowing={glowingCards.moveMaker === card.deckid}
                          isTargetGlowing={glowingCards.targets.includes(card.deckid)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* VS emblem */}
                <div className="text-5xl text-white font-black tracking-tight drop-shadow-lg">VS</div>

                {/* Player 1 active */}
                <div className="flex gap-6 justify-center w-full">
                  {player1Active.length === 0 ? (
                    <div className="text-white/60">No fighters</div>
                  ) : player1Active.map((card, idx) => (
                    <div key={getUniqueKey("Player1", card.deckid)} className={`transform transition duration-300 ${glowingCards.moveMaker === card.deckid ? "scale-105" : ""}`}>
                      <div className="w-44">
                        <BattleCard
                          character={card.character}
                          currentHP={card.currentStats.hp}
                          maxHP={card.maxHP}
                          currentStats={card.currentStats}
                          selectedMoves={card.character.selectedMoves}
                          onMoveSelect={(move) => handleMoveSelect(card.deckid, "Player 1", card.character, card.currentStats.hp, move)}
                          selectedMove={selectedMoves.find((m) => m.player === "Player 1" && m.deckid === card.deckid)?.move}
                          disabled={turn !== "Player 1" || faintedPlayer1[card.deckid]}
                          isGlowing={glowingCards.moveMaker === card.deckid}
                          isTargetGlowing={glowingCards.targets.includes(card.deckid)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded text-white text-sm font-semibold shadow-md">Arena</div>
                <div className="text-white/70 text-sm">Choose moves, confirm and watch the clash</div>
              </div>

              <div className="flex items-center gap-3">
                {(
                  <button onClick={handleConfirm} className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold rounded-lg shadow hover:scale-105 transition transform">
                    Confirm Moves
                  </button>
                )}
                <div className="text-xs text-white/60">Selected: <span className="text-white font-semibold ml-1">{selectedMoves.length}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Player 1 panel */}
        <div className="col-span-3 flex flex-col items-center gap-4">
          {renderPlayerPanel("Player 1", player1Active, player1Benched, () => setPlayer1DeckOpen(true))}
        </div>
      </main>

      {/* Deck Modals (unchanged usage) */}
      <DeckModal open={player2DeckOpen} swapMethod={swapMethod} onOpenChange={setPlayer2DeckOpen} title="Player 2 Deck" deck={player2Benched} showSwap />
      <DeckModal open={player1DeckOpen} swapMethod={swapMethod} onOpenChange={setPlayer1DeckOpen} title="Player 1 Deck" deck={player1Benched} showSwap />

      {/* Swap selector modal - stylized */}
      {swapSelectorOpen && pendingSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-2xl w-full bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white text-lg font-bold">Swap Active Slot</h3>
                <p className="text-sm text-white/70">Select which active character to swap with the benched card.</p>
              </div>
              <div className="text-white/60">Source: <span className="font-semibold">{pendingSwap.swapPlayer}</span></div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4 justify-center">
                {(pendingSwap.swapPlayer.toLowerCase().includes("player 1") ? player1Active : player2Active).length === 0 ? (
                  <div className="text-white/60">No active cards available</div>
                ) : (
                  (pendingSwap.swapPlayer.toLowerCase().includes("player 1") ? player1Active : player2Active).map((card, idx) => {
                    const selected = selectedActiveIndexForSwap === idx;
                    return (
                      <div
                        key={getUniqueKey("swapActive", `${pendingSwap.swapPlayer}-${card.deckid}`)}
                        onClick={() => setSelectedActiveIndexForSwap(idx)}
                        className={`cursor-pointer p-3 rounded-xl border ${selected ? "ring-4 ring-yellow-400/40 bg-white/3" : "bg-black/20 border-white/5"} transition`}
                      >
                        <img src={card.character.image} alt={card.character.name} className="w-28 h-28 object-cover rounded-md" />
                        <div className="mt-2 text-sm text-white/90 text-center font-semibold">{card.character.name}</div>
                        <div className="text-xs text-white/60 text-center mt-1">HP {Math.max(0, card.currentStats.hp)}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button className="px-4 py-2 bg-red-600 rounded text-white" onClick={cancelSwap}>Cancel</button>
                <button
                  className={`px-4 py-2 rounded font-semibold ${selectedActiveIndexForSwap === null ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-gradient-to-r from-yellow-400 to-orange-400 text-black"}`}
                  onClick={confirmSwap}
                  disabled={selectedActiveIndexForSwap === null}
                >
                  Confirm Swap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target selection modal - prettified */}
      {targetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-3xl w-full bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Select {targetModal.type === "single" ? "1 Target" : "2 Targets"} for <span className="text-yellow-400">{targetModal.move.name}</span></h3>
              <div className="text-sm text-white/60">Move by <span className="font-semibold text-white">{targetModal.moveMaker.name}</span></div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {battlefieldCards
                .filter((c) => c.deckid !== targetModal.deckid)
                .map((card) => {
                  const selected = tempTargets.find((t) =>
                    t.player === card.player && t.targetIndex === card.activeIndex && t.deckid === card.deckid
                  );
                  return (
                    <div
                      key={getUniqueKey("Target", `${card.player}-${card.deckid}`)}
                      className={`p-3 rounded-lg cursor-pointer border ${selected ? "ring-4 ring-yellow-400/30 bg-white/2" : "bg-black/20 border-white/5"} flex flex-col items-center`}
                      onClick={() => toggleTempTarget(card)}
                    >
                      <img src={card.character.image} alt={card.character.name} className="w-28 h-28 object-cover rounded-md" />
                      <div className="mt-2 text-white font-semibold text-sm text-center">{card.character.name}</div>
                      <div className="text-xs text-white/60 mt-1">{card.player}</div>
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button className="px-4 py-2 bg-red-600 rounded text-white" onClick={() => setTargetModal(null)}>Cancel</button>
              <button
                className={`px-4 py-2 rounded ${tempTargets.length !== (targetModal.type === "single" ? 1 : 2) ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-gradient-to-r from-emerald-400 to-lime-300 text-black font-semibold"}`}
                disabled={tempTargets.length !== (targetModal.type === "single" ? 1 : 2)}
                onClick={handleTargetConfirm}
              >
                Confirm Target
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
}
