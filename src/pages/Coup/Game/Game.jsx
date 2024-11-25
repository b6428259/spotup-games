// Game.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, onValue, get, set, serverTimestamp } from 'firebase/database';
import { db } from '../../../../firebase';
import { motion } from 'framer-motion';
import ChallengeModal from '../components/ChallengeModal';

// Import Components
import PlayerCard from '../components/PlayerCard.jsx';
import GameLog from '../components/GameLog';
import ActionButtonsContainer from '../components/ActionButtonsContainer';
import InitialCardsModal from '../components/InitialCardsModal.jsx';

// Import Context
import { useGame } from '../context/GameContext.jsx';

// Import Images
import BackCard from '../../../assets/coup/BackCard.jpg';
import AmbassadorCard from '../../../assets/coup/Ambassador.jpg';
import AssassinCard from '../../../assets/coup/Assassin.jpg';
import CaptainCard from '../../../assets/coup/Captain.jpg';
import ContessaCard from '../../../assets/coup/Contessa.jpg';
import DukeCard from '../../../assets/coup/Duke.jpg';

const Game = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [playerName] = useState(localStorage.getItem('playerName'));
    const [showInitialCards, setShowInitialCards] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const {
        gameState,
        setGameState,
        gameLogs,
        setGameLogs,
        isValidGame,
        setIsValidGame,
        addGameLog
    } = useGame();

    const cardImages = {
        'Ambassador': AmbassadorCard,
        'Assassin': AssassinCard,
        'Captain': CaptainCard,
        'Contessa': ContessaCard,
        'Duke': DukeCard
    };

    

    useEffect(() => {
        const roomRef = ref(db, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                navigate('/');
                return;
            }
    
            const data = snapshot.val();
            
            // Check if game is finished
            if (data.state === 'finished') {
                navigate(`/lobby/${roomId}`);
                return;
            }
    
            setGameState(prevState => ({
                ...prevState,
                challenger: data.challenger || null,
                challengedPlayer: data.challengedPlayer || null,
                claimedCard: data.claimedCard || null,
                challengeOutcome: data.challengeOutcome || null,
                players: data.players || [],
                coins: data.coins || {},
                cards: data.cards || {},
                deck: data.deck || [],
                currentTurn: data.currentTurn || 0,
                currentPhase: data.currentPhase || 'initial',
                eliminatedPlayers: data.eliminatedPlayers || []
            }));
    
            setIsValidGame(data.state === 'playing');
        });
    
        return () => unsubscribe();
    }, [roomId, navigate, setGameState, setIsValidGame]);


    const handleChallenge = async () => {
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);
    
            if (snapshot.exists()) {
                const currentGameState = snapshot.val();
                const { challengedPlayer, claimedCard, cards } = currentGameState;
    
                const hasClaimedCard = cards[challengedPlayer].includes(claimedCard);
                let logMessage = '';
    
                // Create updated game state
                const updatedGameState = {
                    ...currentGameState,
                    currentPhase: 'action',
                    challenger: null,
                    challengedPlayer: null,
                    claimedCard: null,
                    challengeOutcome: hasClaimedCard,
                };
    
                // Handle card loss based on challenge outcome
                const losingPlayer = hasClaimedCard ? playerName : challengedPlayer;
                if (updatedGameState.cards[losingPlayer]) {
                    updatedGameState.cards[losingPlayer].pop();
                }
    
                // Check for player elimination
                updatedGameState.eliminatedPlayers = checkPlayerElimination(
                    updatedGameState.cards, 
                    losingPlayer, 
                    currentGameState
                );
    
                // Check for game end
                const winner = checkGameEnd(
                    updatedGameState.cards, 
                    updatedGameState.players, 
                    updatedGameState.eliminatedPlayers
                );
    
                if (winner) {
                    // Game has ended
                    logMessage = `${winner} wins the game!`;
                    // Navigate back to lobby and cleanup
                    await set(roomRef, {
                        state: 'finished',
                        winner: winner,
                        lastActivity: serverTimestamp()
                    });
                    navigate(`/lobby/${roomId}`);
                } else {
                    // Game continues
                    updatedGameState.currentTurn = 
                        (currentGameState.currentTurn + 1) % currentGameState.players.length;
                    logMessage = hasClaimedCard ? 
                        `${challengedPlayer} proves they have ${claimedCard}, ${playerName} loses a card` :
                        `${playerName} successfully challenges ${challengedPlayer}, who loses a card`;
    
                    await set(roomRef, {
                        ...updatedGameState,
                        lastActivity: serverTimestamp()
                    });
                }
    
                await addGameLog(roomId, logMessage, 'challenge', playerName);
                setModalOpen(false);
            }
        } catch (error) {
            console.error("Error handling challenge:", error);
        }
    };
    const handleSkipChallenge = async () => {
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const currentGameState = snapshot.val();

                // เคลียร์สถานะ Challenge
                const updatedGameState = {
                    ...currentGameState,
                    currentPhase: 'action', // เปลี่ยนเฟสกลับเป็น action
                    challenger: null,
                    challengedPlayer: null,
                    claimedCard: null,
                    // เพิ่มการอัพเดทเทิร์น
                    currentTurn: (currentGameState.currentTurn + 1) % currentGameState.players.length
                };

                // เพิ่ม log
                const logMessage = `${playerName} เลือกที่จะไม่ Challenge`;

                await set(roomRef, {
                    ...updatedGameState,
                    lastActivity: serverTimestamp()
                });

                await addGameLog(roomId, logMessage, 'challenge', playerName);

                // ปิด modal
                setModalOpen(false);
            }
        } catch (error) {
            console.error("Error skipping challenge:", error);
        }
    };

    const handleAction = async (actionName, options = {}) => {
        if (gameState.players[gameState.currentTurn] !== playerName) return;

        const { targetPlayer, claimedCard, challengeable } = options;

        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const currentGameState = snapshot.val();
                const updatedGameState = {
                    ...currentGameState,
                    eliminatedPlayers: currentGameState.eliminatedPlayers || []
                };
                let logMessage = '';

                switch (actionName) {
                    case 'Income':
                        updatedGameState.coins[playerName] = (updatedGameState.coins[playerName] || 0) + 1;
                        logMessage = `${playerName} ใช้ Income (+1 เหรียญ)`;
                        break;
                    case 'Foreign Aid':
                        updatedGameState.coins[playerName] = (updatedGameState.coins[playerName] || 0) + 2;
                        logMessage = `${playerName} ใช้ Foreign Aid (+2 เหรียญ)`;
                        break;
                    case 'Tax':
                        // เพิ่มสถานะ challenge สำหรับ Tax
                        if (challengeable) {
                            updatedGameState.currentPhase = 'challenge';
                            updatedGameState.challengedPlayer = playerName;
                            updatedGameState.claimedCard = 'Duke';
                            logMessage = `${playerName} อ้างว่ามี Duke`;
                        } else {
                            updatedGameState.coins[playerName] = (updatedGameState.coins[playerName] || 0) + 3;
                            logMessage = `${playerName} ใช้ Tax (+3 เหรียญ)`;
                        }
                        break;
                    case 'Steal':
                        // เพิ่มสถานะ challenge สำหรับ Steal
                        if (challengeable) {
                            updatedGameState.currentPhase = 'challenge';
                            updatedGameState.challengedPlayer = playerName;
                            updatedGameState.claimedCard = 'Captain';
                            logMessage = `${playerName} อ้างว่ามี Captain`;
                        } else {
                            logMessage = `${playerName} พยายามขโมยเหรียญ`;
                        }
                        break;
                    case 'Assassinate':
                        // เพิ่มสถานะ challenge สำหรับ Assassinate
                        if (challengeable) {
                            updatedGameState.currentPhase = 'challenge';
                            updatedGameState.challengedPlayer = playerName;
                            updatedGameState.claimedCard = 'Assassin';
                            updatedGameState.coins[playerName] = (updatedGameState.coins[playerName] || 0) - 3;
                            logMessage = `${playerName} อ้างว่ามี Assassin`;
                        } else {
                            updatedGameState.coins[playerName] = (updatedGameState.coins[playerName] || 0) - 3;
                            logMessage = `${playerName} ใช้ Assassinate (-3 เหรียญ)`;
                        }
                        break;
                    case 'Exchange':
                        // เพิ่มสถานะ challenge สำหรับ Exchange
                        if (challengeable) {
                            updatedGameState.currentPhase = 'challenge';
                            updatedGameState.challengedPlayer = playerName;
                            updatedGameState.claimedCard = 'Ambassador';
                            logMessage = `${playerName} อ้างว่ามี Ambassador`;
                        }
                        break;
                    case 'Challenge':
                        console.log("Processing challenge from", playerName);
                        updatedGameState.challenger = playerName;
                        updatedGameState.currentPhase = 'challenge';
                        logMessage = `${playerName} challenges ${targetPlayer}'s ${claimedCard}`;
                        break;
                    case 'SkipChallenge':
                        // เคลียร์สถานะ challenge และดำเนินการ action ต่อ
                        updatedGameState.currentPhase = 'action';
                        updatedGameState.challenger = null;
                        updatedGameState.challengedPlayer = null;
                        updatedGameState.claimedCard = null;
                        logMessage = `${playerName} ไม่ challenge`;
                        break;
                }

                // อัพเดทเทิร์นเฉพาะเมื่อ:
                if (!challengeable ||
                    actionName === 'SkipChallenge' ||
                    (actionName !== 'Challenge' && updatedGameState.currentPhase === 'action')) {
                    updatedGameState.currentTurn =
                        (updatedGameState.currentTurn + 1) % updatedGameState.players.length;
                }

                await set(roomRef, {
                    ...updatedGameState,
                    lastActivity: serverTimestamp()
                });

                if (logMessage) {
                    await addGameLog(roomId, logMessage, 'action', playerName);
                }
            }
        } catch (error) {
            console.error("Error performing action:", error);
        }
    };


    const checkPlayerElimination = (cards, playerName, currentGameState) => {
        // If player has no cards, they are eliminated
        if (!cards[playerName] || cards[playerName].length === 0) {
            const updatedEliminatedPlayers = [...(currentGameState.eliminatedPlayers || [])];
            if (!updatedEliminatedPlayers.includes(playerName)) {
                updatedEliminatedPlayers.push(playerName);
            }
            return updatedEliminatedPlayers;
        }
        return currentGameState.eliminatedPlayers || [];
    };

    const checkGameEnd = (cards, players, eliminatedPlayers) => {
        // Count players still in game (have cards)
        const playersWithCards = players.filter(player => 
            !eliminatedPlayers.includes(player) && 
            cards[player] && 
            cards[player].length > 0
        );
    
        return playersWithCards.length === 1 ? playersWithCards[0] : null;
    };

    useEffect(() => {
        const currentPlayer = localStorage.getItem('playerName');
        console.log('Modal check:', {
            currentPhase: gameState.currentPhase,
            currentPlayer,
            challengedPlayer: gameState.challengedPlayer,
            challenger: gameState.challenger
        });

        const shouldShowModal =
            gameState.currentPhase === 'challenge' &&
            currentPlayer !== gameState.challengedPlayer &&
            !gameState.challenger;

        console.log('Should show modal:', shouldShowModal);
        setModalOpen(shouldShowModal);
    }, [gameState.currentPhase, gameState.challengedPlayer, gameState.challenger]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6"
        >
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gameState.players.map((player, index) => (
                        <PlayerCard
                            key={player}
                            player={player}
                            index={index}
                            isCurrentPlayer={player === playerName}
                            isCurrentTurn={index === gameState.currentTurn}
                            isEliminated={gameState.eliminatedPlayers.includes(player)}
                            coins={gameState.coins[player]}
                            cards={gameState.cards[player] || []}
                            cardImages={cardImages}
                            BackCard={BackCard}
                            isValidGame={isValidGame}
                        />
                    ))}
                </div>
                <ActionButtonsContainer
                    isCurrentPlayerTurn={gameState.players[gameState.currentTurn] === playerName}
                    playerCoins={gameState.coins[playerName] || 0}
                    onActionSelect={handleAction}
                    gameState={gameState} // เพิ่มส่วนนี้
                />

                {/* Game Log */}
                <GameLog logs={gameLogs} />
            </div>

            {/* Initial Cards Modal */}
            <InitialCardsModal
                showInitialCards={showInitialCards}
                playerCards={gameState.cards[playerName]}
                cardImages={cardImages}
                onClose={() => setShowInitialCards(false)}
            />
            <ChallengeModal
                isOpen={modalOpen}
                challenger={gameState.challenger}
                challengedPlayer={gameState.challengedPlayer}
                claimedCard={gameState.claimedCard}
                onConfirm={handleChallenge}
                onSkip={handleSkipChallenge}
            />

        </motion.div>
    );
};

export default Game;