import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { useEffect } from 'react';

const ChallengeModal = ({ isOpen, challenger, challengedPlayer, claimedCard, onConfirm, onSkip }) => {
    console.log('Challenge Modal Props:', { isOpen, challenger, challengedPlayer, claimedCard });
    
    if (!isOpen) return null;
    useEffect(() => {
        console.log('ChallengeModal props updated:', {
            isOpen,
            challenger,
            challengedPlayer,
            claimedCard
        });
    }, [isOpen, challenger, challengedPlayer, claimedCard]);
    return (
        <Dialog open={isOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Challenge เกิดขึ้น</DialogTitle>
                    <DialogDescription>
                        {challenger} ท้าทาย {challengedPlayer} ว่ามีการ์ด {claimedCard}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <button 
                        onClick={onConfirm} 
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                    >
                        ยืนยัน Challenge
                    </button>
                    <button 
                        onClick={onSkip} 
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
                    >
                        ข้าม Challenge
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChallengeModal;
