"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CharacterCard from "@/components/CharacterCard/page";

export default function CharacterSelectionModal({ open, onClose, onConfirm, player }: any) {
  const [selected, setSelected] = useState<number[]>([]);
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
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else if (selected.length < 4) {
      setSelected([...selected, id]);
    }
  };

  const handleConfirm = () => {
    const selectedCharacters = characters.filter((char) => selected.includes(char.id));
    onConfirm(player, selectedCharacters);
    onClose();
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Force override ShadCN width */}
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
              selected={selected.includes(char.id)}
              onSelect={toggleSelect}
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
