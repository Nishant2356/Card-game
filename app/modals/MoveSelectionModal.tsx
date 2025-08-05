"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type Move = { name: string; type: string; power?: number; description?: string };

export default function MoveSelectionModal({
  open,
  onClose,
  movePool,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  movePool: Move[];
  onSelect: (move: Move) => void;
}) {
  const handleSelect = (move: Move) => {
    onSelect(move); // Pass selected move back to CharacterCard
    onClose(); // Close modal immediately after selection
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Move</DialogTitle>
        </DialogHeader>

        {/* Scrollable container */}
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
          {movePool.map((move, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              <div>
                <div className="font-bold">{move.name}</div>
                <div className="text-sm text-gray-600">{move.type}</div>
              </div>
              <div className="flex items-center gap-2">
                {move.power !== undefined && (
                  <span className="text-xs font-semibold text-gray-700">Power: {move.power}</span>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-5 h-5 text-blue-500 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{move.description || "No description available"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button size="sm" onClick={() => handleSelect(move)}>
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
