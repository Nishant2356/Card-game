"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PlayerDeck from "@/components/PlayerDeck/PlayerDeck";

export default function DeckModal({
  open,
  swapMethod,
  onOpenChange,
  title,
  deck,
  showSwap = false,
}: {
  open: boolean;
  swapMethod: (swapIndex: number, swapPlayer: string) => void;
  onOpenChange: (open: boolean) => void;
  title: string;
  deck: any[];
  showSwap?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PlayerDeck deck={deck} title={title} swapMethod={swapMethod} showSwap={showSwap} />
      </DialogContent>
    </Dialog>
  );
}
