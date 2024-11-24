// TargetSelectionWindow.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get, set } from 'firebase/database';
import { db } from '../../../../firebase';
import { User, X } from 'lucide-react';

const TargetSelectionWindow = ({ roomId, gameState, playerName }) => {
    const [showSelection, setShowSelection] = useState(false);

    useEffect(() => {
        const shouldShow = gameState.currentPhase === 'targetSelection' && 
                         gameState.currentAction?.player === playerName;
        console.log("Target Selection Window State:", {
            currentPhase: gameState.currentPhase,
            currentAction: gameState.currentAction,
            shouldShow
        });
        setShowSelection(shouldShow);
    }, [gameState, playerName]);

    const handleTargetSelection = async (targetPlayer) => {
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);
            
            if (snapshot.exists()) {
                const currentState = snapshot.val();
                const currentAction = currentState.currentAction;

                if (!currentAction) {
                    console.error("No current action found");
                    return;
                }

                // Create updated action with target
                const updatedAction = {
                    ...currentAction,
                    target: targetPlayer,
                    timestamp: Date.now()
                };

                // Handle immediate costs
                let updatedCoins = { ...currentState.coins };
                if (currentAction.name === 'Coup') {
                    updatedCoins[playerName] -= 7;
                }
                if (currentAction.name === 'Assassinate') {
                    updatedCoins[playerName] -= 3;
                }

                const updatedState = {
                    ...currentState,
                    currentPhase: currentAction.name === 'Coup' ? 'action' : 'challenge',
                    currentAction: updatedAction,
                    coins: updatedCoins
                };

                // If it's a Coup (which can't be challenged), move to next turn
                if (currentAction.name === 'Coup') {
                    updatedState.currentTurn = (currentState.currentTurn + 1) % currentState.players.length;
                    updatedState.currentAction = null;
                }

                // Add log
                const newLog = {
                    message: `${playerName} targets ${targetPlayer} with ${currentAction.name}`,
                    type: 'action',
                    time: new Date().toLocaleTimeString(),
                    player: playerName
                };
                updatedState.logs = [...(currentState.logs || []), newLog];

                console.log("Updating state after target selection:", updatedState);
                await set(roomRef, updatedState);
            }
        } catch (error) {
            console.error("Error in target selection:", error);
        }
        setShowSelection(false);
    };

    if (!showSelection) return null;

    // Only show valid targets (not eliminated players and not self)
    const validTargets = gameState.players.filter(player => 
        player !== playerName && 
        !gameState.eliminatedPlayers?.includes(player)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
                <h2 className="text-xl font-bold text-white mb-4">Select Target</h2>
                <div className="space-y-3">
                    {validTargets.map(player => (
                        <button
                            key={player}
                            onClick={() => handleTargetSelection(player)}
                            className="w-full p-3 bg-gray-700 hover:bg-gray-600 
                                     text-white rounded-lg flex items-center justify-between"
                        >
                            <span>{player}</span>
                            <span>{gameState.coins[player] || 0} coins</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default TargetSelectionWindow;
