import { Character, Move } from "../types";
import { TargetDetails } from "../types";

interface TargetSelectionModalProps {
    battlefieldCards: any[];
    targetModal: {
        type: "single" | "double";
        deckid: string;
        moveMaker: Character;
        move: Move;
        player: "Player 1" | "Player 2";
    } | null;
    setTargetModal: React.Dispatch<
        React.SetStateAction<{
            type: "single" | "double";
            deckid: string;
            moveMaker: Character;
            move: Move;
            player: "Player 1" | "Player 2";
        } | null>
    >;
    tempTargets: TargetDetails[];
    toggleTempTarget: (card: any) => void;
    handleTargetConfirm: () => void;
    getUniqueKey: (player: string, id: string | number) => string;
}

const TargetSelectionModal: React.FC<TargetSelectionModalProps> = ({
    battlefieldCards,
    targetModal,
    setTargetModal,
    tempTargets,
    toggleTempTarget,
    handleTargetConfirm,
    getUniqueKey
}) => {
    return (
        <div>
            {targetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="max-w-3xl w-full bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-lg font-bold">Select {targetModal.type === "single" ? "1 Target" : "2 Targets"} for <span className="text-yellow-400">{targetModal.move.name}</span></h3>
                            <div className="text-sm text-white/60">Move by <span className="font-semibold text-white">{targetModal.moveMaker.name}</span></div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {battlefieldCards
                                .filter((c) => c.deckid !== targetModal.deckid)
                                .map((card) => {
                                    const selected = tempTargets.find((t) =>
                                        t.player === card.player && t.targetIndex === card.activeIndex && t.deckid === card.deckid
                                    );
                                    return (
                                        <div
                                            key={getUniqueKey("Target", `${card.player}-${card.deckid}`)}
                                            className={`p-3 rounded-lg cursor-pointer border ${selected ? "ring-4 ring-yellow-400/30 bg-white/2" : "bg-black/20 border-white/5"} flex flex-col items-center`}
                                            onClick={() => toggleTempTarget(card)}
                                        >
                                            <img src={card.character.image} alt={card.character.name} className="w-28 h-28 object-cover rounded-md" />
                                            <div className="mt-2 text-white font-semibold text-sm text-center">{card.character.name}</div>
                                            <div className="text-xs text-white/60 mt-1">{card.player}</div>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button className="px-4 py-2 bg-red-600 rounded text-white" onClick={() => setTargetModal(null)}>Cancel</button>
                            <button
                                className={`px-4 py-2 rounded ${tempTargets.length !== (targetModal.type === "single" ? 1 : 2) ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-gradient-to-r from-emerald-400 to-lime-300 text-black font-semibold"}`}
                                disabled={tempTargets.length !== (targetModal.type === "single" ? 1 : 2)}
                                onClick={handleTargetConfirm}
                            >
                                Confirm Target
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TargetSelectionModal;