// components/InitialCardsModal.jsx
import { motion } from 'framer-motion';

const InitialCardsModal = ({ 
    showInitialCards, 
    playerCards, 
    cardImages, 
    onClose 
}) => {
    if (!showInitialCards || !playerCards) return null;

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
                    {playerCards.map((card, index) => (
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
                    onClick={onClose}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                >
                    Start Playing
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default InitialCardsModal;