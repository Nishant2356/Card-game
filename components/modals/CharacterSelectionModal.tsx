"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CharacterCard from "@/components/CharacterCard/page";

type Move = { name: string; type: string; power?: number; description?: string };

export default function CharacterSelectionModal({ open, onClose, onConfirm, player }: any) {
  const [selected, setSelected] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/characters")
        .then((res) => res.json())
        .then((data) => setCharacters(data))
        .catch((err) => console.error("Error fetching characters:", err));
    }
  }, [open]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      if (prev.some((c) => c.id === id)) {
        return prev.filter((c) => c.id !== id);
      } else if (prev.length < 4) {
        const char = characters.find((c) => c.id === id);
        if (!char) return prev;
        return [...prev, { id: char.id, name: char.name, moves: char.movePool.slice(0, 4) }];
      }
      return prev;
    });
  };

  const handleSelectionChange = (id: number, moves: Move[]) => {
    setSelected((prev) => prev.map((c) => (c.id === id ? { ...c, moves } : c)));
  };

  const handleConfirm = () => {
    onConfirm(player, selected);
    onClose();
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="!w-[95vw] !max-w-[1800px] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-purple-900 via-indigo-900 to-black border border-purple-700 shadow-2xl rounded-3xl p-6"
        style={{ width: "98vw", maxWidth: "1800px" }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-center text-white drop-shadow-lg tracking-wide">
            Select Your Champions, <span className="text-purple-400">{player}</span>
          </DialogTitle>
          <p className="text-center text-gray-300 mt-2 text-sm opacity-80">
            Choose <span className="text-purple-300 font-semibold">exactly 4</span> fighters for your team
          </p>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {characters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              selected={selected.some((c) => c.id === char.id)}
              onSelect={toggleSelect}
              onSelectionChange={(id, data) => handleSelectionChange(id, data.moves)}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={selected.length !== 4}
            className={`px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
              selected.length === 4
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 shadow-lg"
                : "bg-gray-600 cursor-not-allowed opacity-60"
            }`}
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
