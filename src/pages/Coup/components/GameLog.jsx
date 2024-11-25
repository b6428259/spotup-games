// components/GameLog.jsx
const GameLog = ({ logs }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-xl">
            <h2 className="text-lg font-medium text-white mb-3">Game Log</h2>
            <div className="h-40 overflow-y-auto space-y-2">
                {logs.map((log, index) => (
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

export default GameLog;