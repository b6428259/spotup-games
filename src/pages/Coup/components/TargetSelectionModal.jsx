import React from 'react';

const TargetSelectionModal = ({ isOpen, players, excludedPlayer, onSelectTarget, onClose }) => {
    if (!isOpen) return null;

    const selectablePlayers = players.filter(player => player !== excludedPlayer);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md">
                <h3 className="text-lg font-bold mb-4">เลือกผู้เล่นเป้าหมาย</h3>
                <div className="space-y-2">
                    {selectablePlayers.map(player => (
                        <button
                            key={player}
                            onClick={() => onSelectTarget(player)}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-500"
                        >
                            {player}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-300"
                >
                    ยกเลิก
                </button>
            </div>
        </div>
    );
};

export default TargetSelectionModal;
