// Game.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, onValue, get, set, serverTimestamp } from 'firebase/database';
import { db, updateRoomActivity } from '../../../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Shield, Sword, Crown, User } from 'lucide-react';


import BackCard from '../../../assets/coup/BackCard.jpg';

// Import card images
import AmbassadorCard from '../../../assets/coup/Ambassador.jpg';
import AssassinCard from '../../../assets/coup/Assassin.jpg';
import CaptainCard from '../../../assets/coup/Captain.jpg';
import ContessaCard from '../../../assets/coup/Contessa.jpg';
import DukeCard from '../../../assets/coup/Duke.jpg';
// Import skill images
import CoupSkill from '../../../assets/coup/CoupSkill.jpg';
import ForeignAidSkill from '../../../assets/coup/ForeignAid.jpg';
import IncomeSkill from '../../../assets/coup/Income.jpg';

const Game = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState({
        players: [],
        currentTurn: 0,
        currentPhase: 'initial', // initial, action, challenge, counter, counterChallenge
        actions: [],
        coins: {},
        cards: {},
        eliminatedPlayers: []
    });
    const [playerName] = useState(localStorage.getItem('playerName'));
    const [isValidGame, setIsValidGame] = useState(false);
    const [showInitialCards, setShowInitialCards] = useState(true);
    const [gameLogs, setGameLogs] = useState([]);
    
    useEffect(() => {
        if (!playerName) {
            navigate('/');
            return;
        }
    
        const roomRef = ref(db, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                navigate('/');
                return;
            }
    
            const data = snapshot.val();
            setGameState(prevState => ({
                ...prevState,
                players: data.players || [],
                coins: data.coins || {},
                cards: data.cards || {},
                deck: data.deck || [],
                currentTurn: data.currentTurn || 0,
                currentPhase: data.currentPhase || 'initial',
                eliminatedPlayers: data.eliminatedPlayers || []
            }));
    
            // รับ logs จาก Firebase
            if (data.logs) {
                setGameLogs(data.logs);
            }
    
            setIsValidGame(data.state === 'playing');
            
            if (data.state !== 'playing') {
                navigate(`/lobby/${roomId}`);
                return;
            }
        });
    
        return () => unsubscribe();
    }, [roomId, navigate, playerName]);

    const addGameLog = async (message, type = 'action') => {
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);
            
            if (snapshot.exists()) {
                const currentGameState = snapshot.val();
                const currentTime = new Date().toLocaleTimeString();
                const newLog = {
                    message,
                    type,
                    time: currentTime,
                    player: playerName
                };
    
                const updatedLogs = [...(currentGameState.logs || []), newLog];
                // เก็บเฉพาะ log 50 รายการล่าสุด
                if (updatedLogs.length > 50) {
                    updatedLogs.shift();
                }
    
                await set(roomRef, {
                    ...currentGameState,
                    logs: updatedLogs,
                    lastActivity: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Error adding game log:", error);
        }
    };

    const cardImages = {
        'Ambassador': AmbassadorCard,
        'Assassin': AssassinCard,
        'Captain': CaptainCard,
        'Contessa': ContessaCard,
        'Duke': DukeCard
    };

    const renderPlayerCard = (player, index) => {
        const isCurrentPlayer = player === playerName;
        const isCurrentTurn = index === gameState.currentTurn;
        const isEliminated = gameState.eliminatedPlayers.includes(player);
        const playerCards = gameState.cards[player] || [];

        // ถ้ายังไม่ valid ให้แสดง loading
        if (!isValidGame) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                    <div className="text-white text-xl">กำลังโหลด...</div>
                </div>
            );
        }

        return (
            <motion.div
            key={player}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                relative p-4 rounded-xl shadow-lg
                ${isCurrentPlayer ? 'bg-blue-900' : 'bg-gray-800'}
                ${isCurrentTurn ? 'ring-2 ring-yellow-500' : ''}
                ${isEliminated ? 'opacity-50' : ''}
            `}
        >
                <div className="flex items-center gap-3 mb-3">
                    <User className="w-6 h-6 text-white" />
                    <span className="text-white font-medium">{player}</span>
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span className="text-white">
                            {gameState.coins[player] || 2}
                        </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                    {playerCards.map((card, cardIndex) => (
                        <motion.div
                            key={cardIndex}
                            className="relative w-16 h-24"
                        >
                            <img 
                                src={isCurrentPlayer ? cardImages[card] : BackCard}
                                alt={isCurrentPlayer ? card : 'Hidden Card'}
                                className="w-full h-full rounded-lg object-cover"
                            />
                        </motion.div>
                    ))}
                </div>
                </div>
            </motion.div>
        );
    };

    const renderGameLog = () => {
        return (
            <div className="bg-gray-800 p-4 rounded-xl">
                <h2 className="text-lg font-medium text-white mb-3">Game Log</h2>
                <div className="h-40 overflow-y-auto space-y-2">
                    {gameLogs.map((log, index) => (
                        <div 
                            key={index} 
                            className={`text-sm p-2 rounded ${
                                log.type === 'action' ? 'bg-gray-700' : 'bg-gray-600'
                            }`}
                        >
                            <span className="text-gray-400 text-xs">{log.time}</span>
                            <span className="text-white ml-2">{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    const handleAction = async (actionName) => {
        if (gameState.players[gameState.currentTurn] !== playerName) return;
    
        try {
            const roomRef = ref(db, `rooms/${roomId}`);
            const snapshot = await get(roomRef);
            
            if (snapshot.exists()) {
                const currentGameState = snapshot.val();
                let updatedGameState = { ...currentGameState };
                let logMessage = '';
    
                switch (actionName) {
                    case 'Income':
                        updatedGameState.coins[playerName] += 1;
                        logMessage = `${playerName} ใช้ Income (+1 เหรียญ)`;
                        break;
                    case 'Foreign Aid':
                        updatedGameState.coins[playerName] += 2;
                        logMessage = `${playerName} ใช้ Foreign Aid (+2 เหรียญ)`;
                        break;
                    case 'Tax':
                        updatedGameState.coins[playerName] += 3;
                        logMessage = `${playerName} ใช้ Tax (+3 เหรียญ)`;
                        break;
                    case 'Steal':
                        // จะเพิ่มลอจิกการเลือกเป้าหมายในภายหลัง
                        logMessage = `${playerName} พยายามขโมยเหรียญ`;
                        break;
                    case 'Assassinate':
                        updatedGameState.coins[playerName] -= 3;
                        logMessage = `${playerName} ใช้ Assassinate (-3 เหรียญ)`;
                        break;
                    case 'Coup':
                        updatedGameState.coins[playerName] -= 7;
                        logMessage = `${playerName} ใช้ Coup (-7 เหรียญ)`;
                        break;
                    case 'Exchange':
                        logMessage = `${playerName} ใช้ Exchange`;
                        break;
                }
    
                // อัพเดท turn
                updatedGameState.currentTurn = 
                    (updatedGameState.currentTurn + 1) % updatedGameState.players.length;
    
                // เพิ่ม log
                const currentTime = new Date().toLocaleTimeString();
                const newLog = {
                    message: logMessage,
                    type: 'action',
                    time: currentTime,
                    player: playerName
                };
    
                updatedGameState.logs = [...(updatedGameState.logs || []), newLog];
    
                // อัพเดทข้อมูลเกม
                await set(roomRef, updatedGameState);
            }
        } catch (error) {
            console.error("Error performing action:", error);
        }
    };

    const renderActionButtons = () => {
        // 1. เช็คว่าเป็นเทิร์นของผู้เล่นปัจจุบันหรือไม่
        const isCurrentPlayerTurn = gameState.players[gameState.currentTurn] === playerName;
        
        // 2. ถ้าไม่ใช่เทิร์นของผู้เล่นปัจจุบัน ไม่ต้องแสดงปุ่ม
        if (!isCurrentPlayerTurn) {
            return (
                <div className="text-center text-gray-400 mt-6">
                    รอถึงตาของคุณ...
                </div>
            );
        }
    
        // 3. กำหนดแอคชั่นที่สามารถทำได้
        const actions = [
            { 
                name: 'Income', 
                cost: 0, 
                image: IncomeSkill,
                description: 'รับ 1 เหรียญ'
            },
            { 
                name: 'Foreign Aid', 
                cost: 0, 
                image: ForeignAidSkill,
                description: 'รับ 2 เหรียญ (สามารถถูกขัดขวางโดย Duke)'
            },
            { 
                name: 'Coup', 
                cost: 7, 
                image: CoupSkill,
                description: 'จ่าย 7 เหรียญเพื่อบังคับให้ผู้เล่นอื่นเปิดไพ่ 1 ใบ'
            },
            { 
                name: 'Tax', 
                cost: 0, 
                character: 'Duke',
                image: DukeCard,
                description: 'อ้างว่ามี Duke เพื่อรับ 3 เหรียญ'
            },
            { 
                name: 'Assassinate', 
                cost: 3, 
                character: 'Assassin',
                image: AssassinCard,
                description: 'จ่าย 3 เหรียญเพื่อบังคับให้ผู้เล่นอื่นเปิดไพ่ 1 ใบ'
            },
            { 
                name: 'Exchange', 
                cost: 0, 
                character: 'Ambassador',
                image: AmbassadorCard,
                description: 'แลกไพ่กับกอง'
            },
            { 
                name: 'Steal', 
                cost: 0, 
                character: 'Captain',
                image: CaptainCard,
                description: 'ขโมย 2 เหรียญจากผู้เล่นอื่น'
            }
        ];
    
        const playerCoins = gameState.coins[playerName] || 0;
    
        // 4. แสดงปุ่มแอคชั่น
        return (
            <div className="mt-6">
                <h2 className="text-xl font-bold text-white mb-4">Your Turn - Choose an Action</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {actions.map(action => {
                        const isDisabled = action.cost > playerCoins;
                        
                        return (
                            <motion.button
                                key={action.name}
                                whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                                disabled={isDisabled}
                                onClick={() => handleAction(action.name)}
                                className={`
                                    relative group flex flex-col items-center p-3 rounded-lg
                                    transition-all duration-200
                                    ${isDisabled 
                                        ? 'bg-gray-700 cursor-not-allowed opacity-50' 
                                        : 'bg-gray-800 hover:bg-gray-700'}
                                `}
                            >
                                <img 
                                    src={action.image}
                                    alt={action.name}
                                    className="w-24 h-36 rounded-lg object-cover mb-2"
                                />
                                <div className="text-center">
                                    <span className="text-white font-medium block">
                                        {action.name}
                                    </span>
                                    {action.cost > 0 && (
                                        <span className="text-yellow-500 text-sm block">
                                            Cost: {action.cost} coins
                                        </span>
                                    )}
                                    {action.character && (
                                        <span className="text-blue-400 text-sm block">
                                            Requires: {action.character}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48
                                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                              bg-black text-white text-xs p-2 rounded-lg pointer-events-none">
                                    {action.description}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        );
    };
    // Add initial cards reveal modal
    const InitialCardsModal = () => {
        if (!showInitialCards || !gameState.cards[playerName]) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            >
                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="bg-gray-800 p-6 rounded-xl text-center"
                >
                    <h2 className="text-2xl text-white mb-4">Your Initial Cards</h2>
                    <div className="flex gap-4 justify-center mb-6">
                        {gameState.cards[playerName].map((card, index) => (
                            <motion.div
                                key={index}
                                initial={{ rotateY: 180 }}
                                animate={{ rotateY: 0 }}
                                transition={{ delay: index * 0.5 }}
                                className="relative w-32 h-48"
                            >
                                <img 
                                    src={cardImages[card]}
                                    alt={card}
                                    className="w-full h-full rounded-lg object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowInitialCards(false)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                    >
                        Start Playing
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    };

    useEffect(() => {
        console.log('Current game state:', gameState);
        console.log('Current player:', playerName);
        console.log('Is current player turn:', gameState.players[gameState.currentTurn] === playerName);
    }, [gameState, playerName]);

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
                    {gameState.players.map((player, index) => renderPlayerCard(player, index))}
                </div>
    
                {/* Action Buttons */}
                {renderActionButtons()}
    
                {/* Game Log */}
                {renderGameLog()}
            </div>

            {/* Initial Cards Modal */}
            <InitialCardsModal />
        </motion.div>
    );
};

export default Game;

