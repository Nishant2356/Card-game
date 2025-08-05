"use client";
import { useState } from "react";
import { AiOutlineCheckCircle, AiFillCheckCircle, AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MoveSelectionModal from "@/app/modals/MoveSelectionModal";

type Move = { name: string; type: string; power?: number; description?: string };
type Ability = { name: string; description: string };
type Character = {
  id: number;
  name: string;
  title: string;
  universe: string;
  image: string;
  stats: { hp: number; attack: number; defense: number; speed: number };
  movePool: Move[];
  abilities: { special: Ability; hidden: Ability };
  theme: { primaryColor: string; secondaryColor: string; borderColor: string; glowColor: string };
};

export default function CharacterCard({
  character,
  selected,
  onSelect,
  onSelectionChange,
}: {
  character: Character;
  selected: boolean;
  onSelect: (id: number) => void;
  onSelectionChange: (id: number, data: { name: string; moves: Move[] }) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState<Move[]>(character.movePool.slice(0, 4));
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveIndexToEdit, setMoveIndexToEdit] = useState<number | null>(null);

  const theme = character.theme || {
    primaryColor: "#00e6ff",
    secondaryColor: "#0033cc",
    borderColor: "cyan",
    glowColor: "rgba(0, 150, 255, 0.7)",
  };

  const handleMoveClick = (index: number) => {
    setMoveIndexToEdit(index);
    setMoveModalOpen(true);
  };

  const handleMoveSelect = (newMove: Move) => {
    if (moveIndexToEdit !== null) {
      const updated = [...selectedMoves];
      updated[moveIndexToEdit] = newMove;
      setSelectedMoves(updated);
      if (selected) {
        onSelectionChange(character.id, { name: character.name, moves: updated });
      }
    }
    setMoveModalOpen(false);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(character.id);
    if (!selected) {
      onSelectionChange(character.id, { name: character.name, moves: selectedMoves });
    } else {
      onSelectionChange(character.id, { name: character.name, moves: [] });
    }
  };

  return (
    <TooltipProvider>
      <div className="card-container relative" style={{ perspective: "1000px" }}>
        <div
          className={`card relative ${flipped ? "flipped" : ""}`}
          style={{
            width: "320px",
            height: "500px",
            borderRadius: "20px",
            transformStyle: "preserve-3d",
            transition: "transform 0.8s",
            boxShadow: `0 0 40px ${theme.glowColor}`,
          }}
        >
          {/* Selection Icon */}
          <div className="absolute top-3 left-3 z-30 cursor-pointer" onClick={handleSelectClick}>
            {selected ? (
              <AiFillCheckCircle size={36} className="text-green-400 drop-shadow-lg transform scale-110" />
            ) : (
              <AiOutlineCheckCircle size={36} className="text-white drop-shadow-lg hover:text-green-300" />
            )}
          </div>

          {/* FRONT SIDE */}
          <div
            className="card-side"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "20px",
              overflow: "hidden",
              border: `3px solid ${theme.borderColor}`,
              background: `linear-gradient(145deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
            onClick={() => setFlipped(!flipped)}
          >
            <div style={{ width: "100%", height: "220px", borderBottom: `3px solid ${theme.borderColor}`, overflow: "hidden" }}>
              <img src={character.image} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            <div style={{ padding: "10px", textAlign: "left" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#fff",
                  textShadow: `0 0 10px ${theme.glowColor}`,
                }}
              >
                {character.name} - {character.title}
              </h2>

              {/* Abilities Section (added) */}
              {character.abilities && (
                <div style={{ marginTop: "6px", marginBottom: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                      color: "#fff",
                      marginBottom: "5px",
                    }}
                  >
                    <strong>Special:</strong>&nbsp;{character.abilities.special?.name || "Unknown"}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AiOutlineInfoCircle className="ml-1 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {character.abilities.special?.description || "No description available"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                      color: "#fff",
                    }}
                  >
                    <strong>Hidden:</strong>&nbsp;{character.abilities.hidden?.name || "Unknown"}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AiOutlineInfoCircle className="ml-1 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {character.abilities.hidden?.description || "No description available"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}

              {/* Move List */}
              <ul style={{ padding: 0, listStyle: "none", marginTop: "6px" }}>
                {selectedMoves.map((move, idx) => (
                  <li
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveClick(idx);
                    }}
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#fff",
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                      border: `2px solid ${theme.borderColor}`,
                      borderRadius: "10px",
                      padding: "6px",
                      marginBottom: "6px",
                      boxShadow: `0 0 8px ${theme.glowColor}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {move.name}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AiOutlineInfoCircle className="ml-2 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>{move.description}</TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BACK SIDE with image (added like BattleCard) */}
          <div
            className="card-side"
            style={{
              transform: "rotateY(180deg)",
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "20px",
              border: `3px solid ${theme.borderColor}`,
              background: `linear-gradient(145deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={() => setFlipped(!flipped)}
          >
            <div
              style={{
                width: "100%",
                height: "220px",
                borderBottom: `3px solid ${theme.borderColor}`,
                overflow: "hidden",
              }}
            >
              <img
                src={character.image}
                alt={character.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>
            <div style={{ padding: "16px", flex: 1 }}>
              <h2 style={{ textAlign: "center", fontSize: "18px", marginBottom: "10px" }}>
                Stats
              </h2>
              {Object.entries(character.stats).map(([key, value]) => (
                <div key={key} style={{ margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>{key.toUpperCase()}</span>
                  <div
                    style={{
                      flex: 1,
                      margin: "0 8px",
                      background: "rgba(255,255,255,0.2)",
                      height: "10px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.borderColor}`,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${value}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "14px" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <MoveSelectionModal
          open={moveModalOpen}
          onClose={() => setMoveModalOpen(false)}
          movePool={character.movePool}
          onSelect={handleMoveSelect}
        />

        {selected && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: "4px solid lime", boxShadow: "0 0 20px lime" }}></div>
        )}

        <style>{`
          .card { position: relative; }
          .flipped { transform: rotateY(180deg); }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
