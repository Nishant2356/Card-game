"use client";
import BattleCard from "@/components/BattleCard/page";
import { Button } from "@/components/ui/button";

export default function PlayerDeck({
  deck,
  showSwap = false,
}: {
  deck: any[];
  showSwap?: boolean;
}) {
  return (
    <div className="flex space-x-4">
      {deck.map((card, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <BattleCard
            character={card.character}
            currentHP={card.currentHP}
            maxHP={card.maxHP}
            selectedMoves={card.character.selectedMoves}
          />
          {showSwap && <Button className="mt-2">Swap In</Button>}
        </div>
      ))}
    </div>
  );
}
