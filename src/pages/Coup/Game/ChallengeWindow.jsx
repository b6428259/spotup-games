// ChallengeWindow.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get, set } from 'firebase/database';
import { db } from '../../../../firebase';
import { X, AlertCircle } from 'lucide-react';

export const ChallengeWindow = ({
    roomId,
    gameState,
    playerName,
}) => {
    const [showChallenge, setShowChallenge] = useState(false);
    const [challengeData, setChallengeData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);

    useEffect(() => {
        if (gameState.currentPhase === 'challenge' &&
            !gameState.eliminatedPlayers?.includes(playerName) &&
            gameState.players[gameState.currentTurn] !== playerName &&
            gameState.currentAction?.character) { // Only show if there's a character to challenge
            setShowChallenge(true);
            setChallengeData({
                action: gameState.currentAction,
                player: gameState.players[gameState.currentTurn]
            });
            setTimeLeft(15);
        } else {
            setShowChallenge(false);
        }
    }, [gameState, playerName]);

    useEffect(() => {
        let timer;
        if (showChallenge && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            handleSkipChallenge();
        }
        return () => clearInterval(timer);
    }, [showChallenge, timeLeft]);

    const handleChallenge = async () => {
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const currentState = snapshot.val();
                const challengedPlayer = gameState.players[gameState.currentTurn];
                const challengedAction = gameState.currentAction;

                if (!challengedAction?.character) {
                    console.error("No character associated with this action");
                    return;
                }

                // Update game state for challenge resolution
                await set(roomRef, {
                    ...currentState,
                    currentPhase: 'challengeResolution',
                    challengeState: {
                        challenger: playerName,
                        challenged: challengedPlayer,
                        action: challengedAction,
                        resolved: false
                    }
                });

                // Add to game logs
                const newLog = {
                    message: `${playerName} challenges ${challengedPlayer} who claims to have ${challengedAction.character}`,
                    type: 'challenge',
                    time: new Date().toLocaleTimeString(),
                    player: playerName
                };

                const updatedLogs = [...(currentState.logs || []), newLog];

                await set(roomRef, {
                    ...currentState,
                    currentPhase: 'challengeResolution',
                    challengeState: {
                        challenger: playerName,
                        challenged: challengedPlayer,
                        action: challengedAction,
                        resolved: false
                    },
                    logs: updatedLogs
                });
            }
        } catch (error) {
            console.error("Error handling challenge:", error);
        }
        setShowChallenge(false);
    };

    const handleSkipChallenge = async () => {
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const currentState = snapshot.val();

                // Check if this is the last player to pass on challenging
                const currentPlayerIndex = currentState.players.indexOf(playerName);
                const nextPlayerToRespond = currentState.players.findIndex((player, index) => {
                    return index > currentPlayerIndex &&
                        !currentState.eliminatedPlayers?.includes(player) &&
                        player !== currentState.players[currentState.currentTurn];
                });

                if (nextPlayerToRespond === -1) {
                    // No more players can challenge, proceed with the action
                    await resolveAction(currentState);
                }
            }
        } catch (error) {
            console.error("Error skipping challenge:", error);
        }
        setShowChallenge(false);
    };

    const resolveAction = async (currentState) => {
        if (!currentState.currentAction) {
            console.error("No action to resolve");
            return;
        }

        const action = currentState.currentAction;
        let updatedState = { ...currentState };

        console.log("Resolving action:", action);

        switch (action.name) {
            case 'Tax':
                updatedState.coins[action.player] = (updatedState.coins[action.player] || 0) + 3;
                break;
            case 'Steal':
                if (action.target) {
                    const stealAmount = Math.min(2, updatedState.coins[action.target] || 0);
                    updatedState.coins[action.target] -= stealAmount;
                    updatedState.coins[action.player] = (updatedState.coins[action.player] || 0) + stealAmount;
                }
                break;
            case 'Exchange':
                // Handle exchange logic
                break;
            case 'Assassinate':
                // Move to card reveal phase for target
                updatedState.currentPhase = 'revealCard';
                updatedState.revealingPlayer = action.target;
                return await set(ref(db, `rooms/${roomId}`), updatedState);
        }

        // For non-assassination actions, move to next turn
        updatedState.currentPhase = 'action';
        updatedState.currentTurn = (updatedState.currentTurn + 1) % updatedState.players.length;
        updatedState.currentAction = null;

        await set(ref(db, `rooms/${roomId}`), updatedState);
    };
    if (!showChallenge || !challengeData?.action?.character) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-gray-800 p-6 rounded-xl max-w-md w-full"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Challenge Action?</h2>
                        <span className="text-yellow-500">{timeLeft}s</span>
                    </div>

                    <div className="mb-6">
                        <p className="text-white">
                            {challengeData.player} claims to have {challengeData.action.character} to perform {challengeData.action.name}
                        </p>
                    </div>

                    <div className="flex justify-between gap-4">
                        <button
                            onClick={handleChallenge}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg
                       transition-colors duration-200"
                        >
                            Challenge
                        </button>
                        <button
                            onClick={handleSkipChallenge}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg
                       transition-colors duration-200"
                        >
                            Pass
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export const ChallengeResolutionWindow = ({
    roomId,
    gameState,
    playerName,
}) => {
    const [showResolution, setShowResolution] = useState(false);

    useEffect(() => {
        setShowResolution(
            gameState.currentPhase === 'challengeResolution' &&
            (gameState.challengeState?.challenger === playerName ||
                gameState.challengeState?.challenged === playerName)
        );
    }, [gameState, playerName]);

    const handleRevealCard = async (cardIndex) => {
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const currentState = snapshot.val();
                const challengeState = currentState.challengeState;
                const playerCards = currentState.cards[playerName];
                const revealedCard = playerCards[cardIndex];

                let updatedState = { ...currentState };

                // Check if the challenged player has the claimed character
                if (revealedCard === challengeState.action.character) {
                    // Challenge failed - challenger loses a card
                    updatedState.currentPhase = 'revealCard';
                    updatedState.revealingPlayer = challengeState.challenger;

                    // Add log entry
                    const newLog = {
                        message: `${playerName} revealed ${revealedCard}. Challenge failed!`,
                        type: 'challenge',
                        time: new Date().toLocaleTimeString(),
                        player: playerName
                    };
                    updatedState.logs = [...(updatedState.logs || []), newLog];
                } else {
                    // Challenge succeeded - challenged player loses this card
                    const newCards = [...playerCards];
                    newCards.splice(cardIndex, 1);
                    updatedState.cards[playerName] = newCards;

                    // Add log entry
                    const newLog = {
                        message: `${playerName} didn't have ${challengeState.action.character}. Challenge succeeded!`,
                        type: 'challenge',
                        time: new Date().toLocaleTimeString(),
                        player: playerName
                    };
                    updatedState.logs = [...(updatedState.logs || []), newLog];

                    // If player has no cards left, they're eliminated
                    if (newCards.length === 0) {
                        updatedState.eliminatedPlayers = [
                            ...(updatedState.eliminatedPlayers || []),
                            playerName
                        ];
                    }
                }

                await set(roomRef, updatedState);
            }
        } catch (error) {
            console.error("Error handling card reveal:", error);
        }
    };

    if (!showResolution) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-gray-800 p-6 rounded-xl max-w-md w-full"
                >
                    <h2 className="text-xl font-bold text-white mb-4">
                        {playerName === gameState.challengeState?.challenged
                            ? "Reveal a card to prove your claim"
                            : "Waiting for player to reveal card"}
                    </h2>

                    {playerName === gameState.challengeState?.challenged && (
                        <div className="grid grid-cols-2 gap-4">
                            {gameState.cards[playerName].map((card, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleRevealCard(index)}
                                    className="p-2 bg-gray-700 rounded-lg text-white"
                                >
                                    {card}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};