"use client";
import BattleCard from "@/components/BattleCard/page";
import { Button } from "@/components/ui/button";

export default function PlayerDeck({
  deck,
  title,
  swapMethod,
  showSwap = false,
}: {
  deck: any[];
  title: string;
  swapMethod: (swapIndex: number, swapPlayer: string) => void;
  showSwap?: boolean;
}) {
  const getUniqueKey = (player: string, id: string | number) => `${player}-${id}`;
  return (
    <div className="flex space-x-4">
      {deck.map((card, idx) => (
        <div key={idx} className="flex flex-col items-center">
            <BattleCard
              key={getUniqueKey(title, card.character.id)}
              character={card.character}
              currentHP={card.currentStats.hp}
              maxHP={card.maxHP}
              currentStats={card.currentStats}
              selectedMoves={card.character.selectedMoves}
              onMoveSelect={() => {}}
              selectedMove={null}
              disabled={true}
              isGlowing={false}
              isTargetGlowing={false}
            />
          {showSwap && <Button onClick={() => swapMethod(idx, title)} className="mt-2">Swap In</Button>}
        </div>
      ))}
    </div>
  );
}
