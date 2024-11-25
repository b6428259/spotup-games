// context/GameContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, get, set, serverTimestamp } from 'firebase/database';
import { db } from '../../../../firebase';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState({
        players: [],
        currentTurn: 0,
        currentPhase: 'initial',
        actions: [],
        coins: {},
        cards: {},
        eliminatedPlayers: []
    });
    const [gameLogs, setGameLogs] = useState([]);
    const [isValidGame, setIsValidGame] = useState(false);

    const addGameLog = async (roomId, message, type = 'action', playerName) => {
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

    return (
        <GameContext.Provider value={{
            gameState,
            setGameState,
            gameLogs,
            setGameLogs,
            isValidGame,
            setIsValidGame,
            addGameLog
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};