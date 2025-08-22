"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CharacterSelectionModal from "../../components/modals/CharacterSelectionModal";
import { useSocketContext } from "@/context/SocketContext";

export default function BattlePreparation() {
  const [openModal, setOpenModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const router = useRouter();
  const { playerMap, setPlayerMap, socket, myRoomId } = useSocketContext();
  const mapPlayer = playerMap[socket?.id as string];

  // useEffect(() => {
  //   console.log(teams)
  //   socket?.emit("teamSelected", teams);
  // }, [teams])

  socket?.on('teamSelected', (data) => {
    console.log(playerMap[socket?.id as string])
    setTeams(data);
  });

  socket?.on('goToBattle', (data) => {
    localStorage.setItem("battleTeams", JSON.stringify(teams));
    console.log(teams)
    router.push("/battle-page");
  });

  const handleOpenModal = (player: string) => {
    console.log(mapPlayer)
    if(player!==mapPlayer) {
      return;
    }
    setCurrentPlayer(player);
    setOpenModal(true);
  };

  const handleConfirmSelection = (player: string, characters: any[]) => {
    const updatedTeams = [
      ...teams.filter(t => t.player !== player),
      { player, characters }
    ];
    
    setTeams(updatedTeams);
    console.log(updatedTeams)
    socket?.emit("teamSelected", updatedTeams); // Emit immediately with known value
    setOpenModal(false);
  };

  const goToBattle = () => {
    localStorage.setItem("battleTeams", JSON.stringify(teams));
    console.log(teams)
    router.push("/battle-page");
    socket?.emit("goToBattle", myRoomId);
  };

  const p1 = teams.find((t) => t.player === "Player 1");
  const p2 = teams.find((t) => t.player === "Player 2");

  return (
    <div className="min-h-screen w-full p-8 bg-gradient-to-br from-[#0f172a] via-[#081029] to-[#120717] flex flex-col items-center">
      {/* Soft decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-10 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-700/30 to-transparent blur-3xl opacity-50" />
        <div className="absolute -right-32 bottom-10 w-96 h-96 rounded-full bg-gradient-to-br from-rose-600/25 to-transparent blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center shadow-xl">
            <span className="text-2xl font-extrabold">⚔️</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl text-white font-extrabold">Prepare for the Showdown</h1>
            <p className="text-sm md:text-base text-white/70 mt-1">Pick your anime heroes from different universes — assemble your team and clash!</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-white/70">Ready Teams</div>
          <div className="px-3 py-1 rounded-md bg-white/5 text-white">{teams.length} / 2</div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-8">
        {/* Player 1 card */}
        <section className="w-full md:w-1/3 bg-gradient-to-b from-white/2 to-white/3 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">Player</div>
              <div className="text-xl text-white font-bold">Player 1</div>
            </div>

            <div>
              <Button
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
                onClick={() => handleOpenModal("Player 1")}
              >
                {p1 ? "Re-select" : "Select"}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {p1 && p1.characters && p1.characters.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {p1.characters.map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/6 hover:scale-105 transition">
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
                      <img src={c.image || c.sprite || "/images/placeholder-avatar.png"} alt={c.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-white/60 truncate">{(c.universe || c.origin) ?? "Unknown Universe"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-white/60">No characters selected yet. Click <span className="font-semibold text-white">Select</span> to choose.</div>
            )}
          </div>
        </section>

        {/* Center VS & Start */}
        <section className="w-full md:w-1/3 flex flex-col items-center gap-6">
          <div className="bg-gradient-to-br from-black/60 to-white/2 p-6 rounded-3xl border border-white/6 shadow-2xl w-full flex flex-col items-center">
            <div className="text-6xl md:text-7xl text-white font-extrabold tracking-tight drop-shadow-lg">VS</div>
            <div className="mt-3 text-sm text-white/60">When both players are ready — start the battle</div>

            <div className="mt-6 w-full">
              <Button
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-transform ${teams.length === 2 ? "bg-emerald-500 hover:scale-105" : "bg-white/5 text-white/50 cursor-not-allowed"}`}
                onClick={goToBattle}
              >
                Start Battle
              </Button>

              <div className="mt-3 text-xs text-white/60 text-center">
                {teams.length < 2 ? "Select both player teams to enable." : "All set — good luck!"}
              </div>
            </div>
          </div>

          {/* Quick preview of both teams counts */}
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex-1 bg-black/30 p-3 rounded-lg border border-white/6 text-center">
              <div className="text-sm text-white/70">Player 1</div>
              <div className="text-xl text-white font-bold">{p1?.characters?.length ?? 0}</div>
            </div>
            <div className="flex-1 bg-black/30 p-3 rounded-lg border border-white/6 text-center">
              <div className="text-sm text-white/70">Player 2</div>
              <div className="text-xl text-white font-bold">{p2?.characters?.length ?? 0}</div>
            </div>
          </div>
        </section>

        {/* Player 2 card */}
        <section className="w-full md:w-1/3 bg-gradient-to-b from-white/2 to-white/3 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">Player</div>
              <div className="text-xl text-white font-bold">Player 2</div>
            </div>

            <div>
              <Button
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500"
                onClick={() => handleOpenModal("Player 2")}
              >
                {p2 ? "Re-select" : "Select"}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {p2 && p2.characters && p2.characters.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {p2.characters.map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/6 hover:scale-105 transition">
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
                      <img src={c.image || c.sprite || "/images/placeholder-avatar.png"} alt={c.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-white/60 truncate">{(c.universe || c.origin) ?? "Unknown Universe"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-white/60">No characters selected yet. Click <span className="font-semibold text-white">Select</span> to choose.</div>
            )}
          </div>
        </section>
      </main>

      {/* Footer note */}
      <footer className="w-full max-w-6xl mt-10 text-center text-white/60">
        <div className="text-sm">
          Tip: You can mix characters from different universes — experiment with synergies!
        </div>
      </footer>

      <CharacterSelectionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmSelection}
        player={currentPlayer}
      />
    </div>
  );
}
