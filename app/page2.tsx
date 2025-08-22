"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@/context/SocketContext";

type Role = "Player 1" | "Player 2";

/**
 * Normalize different possible representations into Role or return null if unknown.
 * Examples handled: "Player 1", "player1", "player 1", "player-1", "p1", "Player1", "player2", "p2", etc.
 */
const normalizeRole = (val: unknown): Role | null => {
  if (val === "Player 1" || val === "Player 2") return val as Role;
  if (typeof val !== "string") return null;

  const s = val.trim().toLowerCase();
  const compact = s.replace(/[\s-_]/g, "");

  const player1Set = new Set(["player1", "p1", "1", "playerone", "playerone"]);
  const player2Set = new Set(["player2", "p2", "2", "playertwo", "playertwo"]);

  if (player1Set.has(compact)) return "Player 1";
  if (player2Set.has(compact)) return "Player 2";

  // fallback checks: if the string contains "1" or "2" but isn't garbage
  if (/(^|[^a-z])1($|[^a-z])/.test(s)) return "Player 1";
  if (/(^|[^a-z])2($|[^a-z])/.test(s)) return "Player 2";

  return null;
};

export default function Home() {
  const router = useRouter();
  const { playerMap, socket } = useSocketContext();

  // server-driven navigation
  useEffect(() => {
    if (!socket) return;
    const handler = () => router.push("/battle-preparation");
    socket.on("goToBattlePrep", handler);
    return () => {
      socket.off("goToBattlePrep", handler);
    };
  }, [socket, router]);

  // Build normalized entries: [socketId, Role][]
  const entries = useMemo(() => {
    if (!playerMap) return [] as [string, Role][];

    // raw entries depending on whether playerMap is an Object or a Map
    const raw: [string, unknown][] =
      playerMap instanceof Map ? Array.from(playerMap.entries()) : Object.entries(playerMap);

    const out: [string, Role][] = [];
    for (const [id, val] of raw) {
      const r = normalizeRole(val);
      if (r) out.push([id, r]);
      // if you want to keep unknowns, you can push them with a placeholder or log them
    }
    return out;
  }, [playerMap]);

  // grouped ids by role
  const grouped = useMemo(() => {
    return {
      "Player 1": entries.filter(([, role]) => role === "Player 1").map(([id]) => id),
      "Player 2": entries.filter(([, role]) => role === "Player 2").map(([id]) => id),
    } as { "Player 1": string[]; "Player 2": string[] };
  }, [entries]);

  const handleStart = () => {
    router.push("/battle-preparation");
    try {
      socket?.emit("goToBattlePrep", null);
    } catch (e) {
      // ignore if socket not ready
    }
  };

  const shortId = (id: string) => {
    if (!id) return "-";
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-black text-white p-6">
      <h1 className="text-6xl font-extrabold mb-8 drop-shadow-lg">Battle Arena</h1>

      <Button
        className="px-12 py-6 text-2xl font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-purple-600"
        onClick={handleStart}
      >
        Start Game
      </Button>

      <p className="mt-6 text-lg text-gray-300 opacity-80">Prepare your teams and fight for victory</p>

      {/* Players box */}
      <div className="mt-8 w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Connected Players</h2>
          <div className="text-sm text-gray-300">Total: {entries.length}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Player 1 column */}
          {/* Player 1 column — now glows when at least one Player 1 is present */}
          <div
            className={`p-4 rounded-lg bg-white/3 border border-white/6 transition-shadow duration-300 ${grouped["Player 1"].length > 0
              ? "ring-2 ring-green-400/30 shadow-[0_0_18px_rgba(34,197,94,0.12)]"
              : ""
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Player 1</h3>
              <span className="text-xs text-gray-300">{grouped["Player 1"].length} connected</span>
            </div>

            {grouped["Player 1"].length === 0 ? (
              <div className="text-sm text-gray-400">No Player 1 connected</div>
            ) : (
              <ul className="space-y-2">
                {grouped["Player 1"].map((id) => (
                  <li key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* status dot pulses when a player exists */}
                      <span
                        className={`h-3 w-3 rounded-full shadow-sm ${grouped["Player 1"].length > 0 ? "bg-green-400 animate-pulse" : "bg-gray-500"
                          }`}
                        aria-hidden
                      />
                      <span className="text-sm font-medium">{shortId(id)}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-700/90 text-white">Connected</span>
                  </li>
                ))}
              </ul>
            )}
          </div>


          {/* Player 2 column — now glows when at least one Player 1 is present */}
          <div
            className={`p-4 rounded-lg bg-white/3 border border-white/6 transition-shadow duration-300 ${grouped["Player 2"].length > 0
                ? "ring-2 ring-green-400/30 shadow-[0_0_18px_rgba(34,197,94,0.12)]"
                : ""
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Player 2</h3>
              <span className="text-xs text-gray-300">{grouped["Player 2"].length} connected</span>
            </div>

            {grouped["Player 2"].length === 0 ? (
              <div className="text-sm text-gray-400">No Player 2 connected</div>
            ) : (
              <ul className="space-y-2">
                {grouped["Player 2"].map((id) => (
                  <li key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* status dot pulses when a player exists */}
                      <span
                        className={`h-3 w-3 rounded-full shadow-sm ${grouped["Player 2"].length > 0 ? "bg-green-400 animate-pulse" : "bg-gray-500"
                          }`}
                        aria-hidden
                      />
                      <span className="text-sm font-medium">{shortId(id)}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-700/90 text-white">Connected</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* raw list (every playerMap[key]) */}
        <div className="mt-6">
          <h4 className="text-sm text-gray-300 mb-2">All connections</h4>
          {entries.length === 0 ? (
            <div className="text-sm text-gray-400">No connections yet</div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {entries.map(([id, role]) => (
                <li key={id} className="flex items-center gap-3 bg-white/6 px-3 py-2 rounded-full text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${role === "Player 1" ? "bg-indigo-600/80" : "bg-pink-600/80"}`}
                  >
                    {role}
                  </span>
                  <span className="text-xs text-gray-200">{shortId(id)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
