import { Character } from "@/app/types";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OpponentCardProps {
    character: Character;
    currentHP: number;
    maxHP: number;
    isGlowing?: boolean;
    isTargetGlowing?: boolean;
}

export default function OpponentCard({
    character,
    currentHP,
    maxHP,
    isGlowing = false,
    isTargetGlowing = false,
}: OpponentCardProps) {

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

    const glowStyle = isGlowing
        ? { boxShadow: `0 0 20px 10px rgba(0, 255, 0, 0.7)` }
        : isTargetGlowing
            ? { boxShadow: `0 0 20px 10px rgba(255, 0, 0, 0.7)` }
            : { boxShadow: `0 0 20px ${theme.glowColor}` };

    return (
        <TooltipProvider>
            <div className="card-container relative" style={{ perspective: "1000px" }}>
                <div
                    className={`card relative`}
                    style={{
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: "14px",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.8s, box-shadow 0.3s",
                        ...glowStyle,
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
                </div>
                <style>{`
          .card { position: relative; }
          .flipped { transform: rotateY(180deg); }
          @media (max-width: 768px) {
            .card { width: 140px !important; height: 220px !important; }
            .card h2 { font-size: 11px !important; }
            .card li { font-size: 9px !important; padding: 2px !important; }
          }
        `}</style>
            </div>
        </TooltipProvider>
    );
}