"use client";
import { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export default function BattleCard({
  character,
  currentHP,
  maxHP,
  selectedMoves: initialSelectedMoves,
}: {
  character: Character;
  currentHP: number;
  maxHP: number;
  selectedMoves?: Move[];
}) {
  const [flipped, setFlipped] = useState(false);

  const selectedMoves =
    initialSelectedMoves && initialSelectedMoves.length > 0
      ? initialSelectedMoves
      : character.movePool.slice(0, 4);

  const theme = character.theme || {
    primaryColor: "#00e6ff",
    secondaryColor: "#0033cc",
    borderColor: "cyan",
    glowColor: "rgba(0, 150, 255, 0.7)",
  };

  const hpPercent = Math.max(0, (currentHP / maxHP) * 100);
  const hpColor =
    hpPercent > 50 ? "bg-green-500" : hpPercent > 30 ? "bg-yellow-500" : "bg-red-500";

  const cardWidth = "180px";
  const cardHeight = "280px";

  return (
    <TooltipProvider>
      <div className="card-container relative" style={{ perspective: "1000px" }}>
        <div
          className={`card relative ${flipped ? "flipped" : ""}`}
          style={{
            width: cardWidth,
            height: cardHeight,
            borderRadius: "14px",
            transformStyle: "preserve-3d",
            transition: "transform 0.8s",
            boxShadow: `0 0 20px ${theme.glowColor}`,
          }}
        >
          {/* HP Bar */}
          <div className="absolute top-2 left-2 right-2 h-2 bg-gray-700 rounded-full overflow-hidden z-30">
            <div
              className={`h-full ${hpColor} transition-all duration-300`}
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>

          {/* FRONT SIDE */}
          <div
            className="card-side"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "14px",
              overflow: "hidden",
              border: `2px solid ${theme.borderColor}`,
              background: `linear-gradient(145deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
            onClick={() => setFlipped(!flipped)}
          >
            <div
              style={{
                width: "100%",
                height: "120px",
                borderBottom: `2px solid ${theme.borderColor}`,
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
            <div style={{ padding: "5px", textAlign: "left" }}>
              <h2
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#fff",
                  textShadow: `0 0 6px ${theme.glowColor}`,
                }}
              >
                {character.name} - {character.title}
              </h2>

              {/* Abilities Section */}
              {character.abilities && (
                <div style={{ marginTop: "4px", marginBottom: "5px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "10px",
                      color: "#fff",
                      marginBottom: "3px",
                    }}
                  >
                    <strong>Special:</strong>&nbsp;{" "}
                    {character.abilities.special?.name || "Unknown"}
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
                      fontSize: "10px",
                      color: "#fff",
                    }}
                  >
                    <strong>Hidden:</strong>&nbsp; {character.abilities.hidden?.name || "Unknown"}
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

              {/* Move List (read-only) */}
              <ul style={{ padding: 0, listStyle: "none", marginTop: "4px" }}>
                {selectedMoves.map((move, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#fff",
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                      border: `1.5px solid ${theme.borderColor}`,
                      borderRadius: "6px",
                      padding: "3px",
                      marginBottom: "3px",
                      boxShadow: `0 0 4px ${theme.glowColor}`,
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

          {/* BACK SIDE */}
          <div
            className="card-side"
            style={{
              transform: "rotateY(180deg)",
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "14px",
              border: `2px solid ${theme.borderColor}`,
              background: `linear-gradient(145deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            }}
            onClick={() => setFlipped(!flipped)}
          >
            <div
              style={{
                width: "100%",
                height: "120px",
                borderBottom: `2px solid ${theme.borderColor}`,
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
            <div style={{ padding: "8px", color: "#fff" }}>
              <h2 style={{ textAlign: "center", fontSize: "13px", marginBottom: "6px" }}>
                Stats
              </h2>
              {Object.entries(character.stats).map(([key, value]) => (
                <div
                  key={key}
                  style={{ margin: "4px 0", display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontWeight: "bold", fontSize: "10px" }}>{key.toUpperCase()}</span>
                  <div
                    style={{
                      flex: 1,
                      margin: "0 4px",
                      background: "rgba(255,255,255,0.2)",
                      height: "7px",
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
                  <span style={{ fontSize: "10px" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          .card { position: relative; }
          .flipped { transform: rotateY(180deg); }
          /* Mobile adjustments */
          @media (max-width: 768px) {
            .card {
              width: 140px !important;
              height: 220px !important;
            }
            .card h2 { font-size: 11px !important; }
            .card li { font-size: 9px !important; padding: 2px !important; }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
