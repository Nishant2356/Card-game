"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CharacterCard from "@/components/CharacterCard/page";

type Move = { name: string; type: string; power?: number; description?: string };

export default function CharacterSelectionModal({ open, onClose, onConfirm, player }: any) {
  const [selected, setSelected] = useState<any[]>([]); // Now stores objects: {id, name, moves[]}
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/characters")
        .then((res) => res.json())
        .then((data) => setCharacters(data))
        .catch((err) => console.error("Error fetching characters:", err));
    }
  }, [open]);

  // Toggle selection: add/remove characters with default moves
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

  // Update character's moves when changed inside CharacterCard
  const handleSelectionChange = (id: number, moves: Move[]) => {
    setSelected((prev) =>
      prev.map((c) => (c.id === id ? { ...c, moves } : c))
    );
  };

  const handleConfirm = () => {
    onConfirm(player, selected);
    onClose();
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="!w-[95vw] !max-w-[1800px] max-h-[90vh] overflow-y-auto"
        style={{ width: "98vw", maxWidth: "1800px" }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Select Characters for {player}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
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

        <div className="mt-4 flex justify-end">
          <Button onClick={handleConfirm} disabled={selected.length !== 4}>
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
