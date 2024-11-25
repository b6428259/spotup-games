// components/PlayerCard.jsx
import { motion } from 'framer-motion';
import { User, Crown, Coins } from 'lucide-react';

const PlayerCard = ({ 
    player, 
    index, 
    isCurrentPlayer, 
    isCurrentTurn, 
    isEliminated,
    coins,
    cards,
    cardImages,
    BackCard,
    isValidGame 
}) => {
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
                    <span className="text-white">{coins || 2}</span>
                </div>
                <div className="flex gap-2 mt-2">
                    {cards.map((card, cardIndex) => (
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

export default PlayerCard;