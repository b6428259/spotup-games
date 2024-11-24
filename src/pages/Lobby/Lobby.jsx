// Lobby.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDatabase, ref, onValue, set, serverTimestamp } from 'firebase/database';
import { db, updateRoomActivity, deleteRoom, initializeGame } from '../../../firebase';
import { UserIcon, ArrowLeftIcon, CopyIcon, Crown, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

const Lobby = () => {
    const { roomId } = useParams();
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [roomState, setRoomState] = useState('waiting');
    const navigate = useNavigate();

    const handleCopyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

 
    useEffect(() => {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) {
            navigate('/');
            return;
        }

        const roomRef = ref(db, 'rooms/' + roomId);
        let inactivityTimer;

        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                navigate('/');
                return;
            }

            const data = snapshot.val();
            if (data.players) {
                const playersList = Object.values(data.players);
                setPlayers(playersList);
                setIsHost(playersList[0] === playerName);
            }

            // ติดตาม state ของห้อง
            if (data.state === 'playing') {
                navigate(`/game/${roomId}`);
            }
            setRoomState(data.state || 'waiting');

            // Inactivity check
            const now = Date.now();
            const lastActivityTime = new Date(data.lastActivity || now).getTime();
            const timeSinceLastActivity = now - lastActivityTime;

            if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
                deleteRoom(roomId);
                navigate('/');
            } else {
                clearTimeout(inactivityTimer);
                inactivityTimer = setTimeout(() => {
                    deleteRoom(roomId);
                    navigate('/');
                }, INACTIVITY_TIMEOUT - timeSinceLastActivity);
            }
        });

        return () => {
            unsubscribe();
            clearTimeout(inactivityTimer);
        };
    }, [roomId, navigate]);

    const handleConfirmBack = () => {
        if (isHost) {
            deleteRoom(roomId);
        } else {
            updateRoomActivity(roomId);
        }
        navigate('/');
    };

    const handleStartGame = useCallback(async () => {
        try {
            // เรียกใช้ initializeGame ก่อน
            await initializeGame(roomId, players);
            updateRoomActivity(roomId);
            navigate(`/game/${roomId}`);
        } catch (error) {
            console.error("Error starting game:", error);
        }
    }, [roomId, players, navigate]);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative"
        >
            <div className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{ backgroundImage: "url('/src/assets/coup/CoupBackground.jpg')" }} />

            <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmation(true)}
                    className="absolute top-4 left-4 text-white hover:text-blue-400 transition-all duration-300 flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>กลับ</span>
                </motion.button>

                <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-white">
                                ห้องรอเกม
                            </h1>
                            {isHost && (
                                <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full flex items-center gap-2">
                                    <Crown size={16} />
                                    Host
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <label className="text-gray-300 text-sm mb-2 block">รหัสห้อง</label>
                                <div className="flex items-center justify-between bg-gray-600 rounded-lg p-3">
                                    <span className="text-xl font-mono text-white">{roomId}</span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleCopyRoomId}
                                        className={`text-gray-300 hover:text-white transition-colors duration-300 ${copySuccess ? 'text-green-400' : ''
                                            }`}
                                    >
                                        {copySuccess ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                                    </motion.button>
                                </div>
                            </div>

                            <div className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Users size={20} />
                                        <span>ผู้เล่น ({players.length}/6)</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {players.map((player, index) => (
                                            <motion.div
                                                key={player}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className={`flex items-center ${index === 0 ? 'bg-blue-600' : 'bg-gray-600'
                                                    } rounded-lg p-3`}
                                            >
                                                <UserIcon className="w-5 h-5 text-white mr-3" />
                                                <span className="text-white">{player}</span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartGame}
                            disabled={players.length < 2}
                            className={`w-full p-4 rounded-lg font-bold text-white transition-all duration-300 ${players.length >= 2
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                    : 'bg-gray-600 cursor-not-allowed'
                                }`}
                        >
                            {players.length >= 2 ? 'เริ่มเกม' : `รอผู้เล่นอีก ${2 - players.length} คน`}
                        </motion.button>
                    </div>
                </div>

                <AnimatePresence>
                    {showConfirmation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
                            >
                                <h2 className="text-xl text-white mb-4">ยืนยันการออกจากห้อง?</h2>
                                <p className="text-gray-300 mb-6">
                                    {isHost
                                        ? 'การออกจากห้องจะทำให้ห้องถูกลบและผู้เล่นทั้งหมดจะถูกเตะออก'
                                        : 'คุณต้องการออกจากห้องใช่หรือไม่?'
                                    }
                                </p>
                                <div className="flex justify-end gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowConfirmation(false)}
                                        className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
                                    >
                                        ยกเลิก
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleConfirmBack}
                                        className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors duration-300"
                                    >
                                        ยืนยัน
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Lobby;

