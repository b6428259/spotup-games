
// components/ActionButtonsContainer.jsx
import ActionButton from './ActionButton';
import Income from '../../../assets/coup/Income.jpg';
import ForeignAid from '../../../assets/coup/ForeignAid.jpg';
import Coup from '../../../assets/coup/CoupSkill.jpg';
import Duke from '../../../assets/coup/Duke.jpg';
import Assassin from '../../../assets/coup/Assassin.jpg';
import Ambassador from '../../../assets/coup/Ambassador.jpg';
import Captain from '../../../assets/coup/Captain.jpg';

// components/ActionButtonsContainer.jsx
const ActionButtonsContainer = ({ 
    isCurrentPlayerTurn, 
    playerCoins, 
    onActionSelect,
    gameState
}) => {
    const currentPlayer = localStorage.getItem('playerName');
    
    const actions = [
        { 
            name: 'Income', 
            cost: 0, 
            image: Income,
            description: 'รับ 1 เหรียญ',
            challengeable: false
        },
        { 
            name: 'Foreign Aid', 
            cost: 0, 
            image: ForeignAid,
            description: 'รับ 2 เหรียญ (สามารถถูกขัดขวางโดย Duke)',
            challengeable: false
        },
        { 
            name: 'Coup', 
            cost: 7, 
            image: Coup,
            description: 'จ่าย 7 เหรียญเพื่อบังคับให้ผู้เล่นอื่นเปิดไพ่ 1 ใบ',
            challengeable: false
        },
        {
            name: 'Tax',
            cost: 0,
            character: 'Duke',
            image: Duke,
            description: 'อ้างว่ามี Duke เพื่อรับ 3 เหรียญ',
            challengeable: true
        },
        {
            name: 'Assassinate',
            cost: 3,
            character: 'Assassin',
            image: Assassin,
            description: 'จ่าย 3 เหรียญเพื่อบังคับให้ผู้เล่นอื่นเปิดไพ่ 1 ใบ',
            challengeable: true
        },
        {
            name: 'Exchange',
            cost: 0,
            character: 'Ambassador',
            image: Ambassador,
            description: 'แลกไพ่กับกอง',
            challengeable: true
        },
        {
            name: 'Steal',
            cost: 0,
            character: 'Captain',
            image: Captain,
            description: 'ขโมย 2 เหรียญจากผู้เล่นอื่น',
            challengeable: true
        }
    ];

    const handleActionSelect = (action) => {
        if (action.challengeable) {
            // ส่งข้อมูลการ action ที่สามารถ challenge ได้
            onActionSelect(action.name, {
                targetPlayer: gameState.players[gameState.currentTurn], // เพิ่ม targetPlayer
                claimedCard: action.character, // เพิ่ม claimedCard
                challengeable: true
            });
        } else {
            // ส่ง action ปกติ
            onActionSelect(action.name);
        }
    };

    if (!isCurrentPlayerTurn) {
        return (
            <div className="text-center text-gray-400 mt-6">
                รอถึงตาของคุณ...
            </div>
        );
    }

    // แสดงปุ่ม Challenge เฉพาะสำหรับผู้เล่นอื่นที่ไม่ใช่ผู้เล่นปัจจุบัน
    if (gameState.currentPhase === 'challenge' && currentPlayer !== gameState.challengedPlayer) {
        return (
            <div className="mt-6 text-center">
                <div className="mb-4 text-white">
                    {`${gameState.challengedPlayer} กำลังใช้การ์ด ${gameState.claimedCard}`}
                </div>
                <button
                    onClick={() => onActionSelect('Challenge')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 mr-4"
                >
                    Challenge
                </button>
                <button
                    onClick={() => onActionSelect('SkipChallenge')}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400"
                >
                    ไม่ Challenge
                </button>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Turn - Choose an Action</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {actions.map(action => (
                    <ActionButton
                        key={action.name}
                        action={action}
                        playerCoins={playerCoins}
                        onActionSelect={() => handleActionSelect(action)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActionButtonsContainer;