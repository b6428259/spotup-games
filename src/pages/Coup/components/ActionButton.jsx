// components/ActionButton.jsx
import { motion } from 'framer-motion';

const ActionButton = ({ 
    action, 
    playerCoins, 
    onActionSelect 
}) => {
    const isDisabled = action.cost > playerCoins;

    return (
        <motion.button
            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
            disabled={isDisabled}
            onClick={() => onActionSelect(action.name)}
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
};

export default ActionButton;