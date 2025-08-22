interface SwapSelectorModalProps {
    swapSelectorOpen: boolean;
    pendingSwap: {
        benchIndex: number;
        swapPlayer: string;
    } | null;
    player1Active: any[];
    player2Active: any[];
    getUniqueKey: (player: string, id: string | number) => string;
    selectedActiveIndexForSwap: number | null;
    setSelectedActiveIndexForSwap: React.Dispatch<React.SetStateAction<number | null>>;
    confirmSwap: () => void;
    cancelSwap: () => void;
}

const SwapSelectorModal: React.FC<SwapSelectorModalProps> = ({
    swapSelectorOpen,
    pendingSwap,
    player1Active,
    player2Active,
    getUniqueKey,
    selectedActiveIndexForSwap,
    setSelectedActiveIndexForSwap,
    confirmSwap,
    cancelSwap
}) => {
    return (
        <div>
            {/* Swap selector modal - stylized */}
            {swapSelectorOpen && pendingSwap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="max-w-2xl w-full bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-white text-lg font-bold">Swap Active Slot</h3>
                                <p className="text-sm text-white/70">Select which active character to swap with the benched card.</p>
                            </div>
                            <div className="text-white/60">Source: <span className="font-semibold">{pendingSwap.swapPlayer}</span></div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4 justify-center">
                                {(pendingSwap.swapPlayer.toLowerCase().includes("player 1") ? player1Active : player2Active).length === 0 ? (
                                    <div className="text-white/60">No active cards available</div>
                                ) : (
                                    (pendingSwap.swapPlayer.toLowerCase().includes("player 1") ? player1Active : player2Active).map((card, idx) => {
                                        const selected = selectedActiveIndexForSwap === idx;
                                        return (
                                            <div
                                                key={getUniqueKey("swapActive", `${pendingSwap.swapPlayer}-${card.deckid}`)}
                                                onClick={() => setSelectedActiveIndexForSwap(idx)}
                                                className={`cursor-pointer p-3 rounded-xl border ${selected ? "ring-4 ring-yellow-400/40 bg-white/3" : "bg-black/20 border-white/5"} transition`}
                                            >
                                                <img src={card.character.image} alt={card.character.name} className="w-28 h-28 object-cover rounded-md" />
                                                <div className="mt-2 text-sm text-white/90 text-center font-semibold">{card.character.name}</div>
                                                <div className="text-xs text-white/60 text-center mt-1">HP {Math.max(0, card.currentStats.hp)}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button className="px-4 py-2 bg-red-600 rounded text-white" onClick={cancelSwap}>Cancel</button>
                                <button
                                    className={`px-4 py-2 rounded font-semibold ${selectedActiveIndexForSwap === null ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-gradient-to-r from-yellow-400 to-orange-400 text-black"}`}
                                    onClick={confirmSwap}
                                    disabled={selectedActiveIndexForSwap === null}
                                >
                                    Confirm Swap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SwapSelectorModal;