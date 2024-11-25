import React from 'react'
import BaseModal from './BaseModal'
import { Button } from '@/components/ui/button'

const ActionTargetModal = ({
  isOpen,
  onOpenChange,
  action,
  players = [],
  currentPlayer,
  eliminatedPlayers = [],
  onSelectTarget,
}) => {
  const getActionDescription = () => {
    switch (action) {
      case 'Assassinate':
        return {
          title: 'Select Target to Assassinate',
          description: 'Choose a player to assassinate. This will cost 3 coins.',
          buttonText: 'Assassinate'
        }
      case 'Steal':
        return {
          title: 'Select Target to Steal From',
          description: 'Choose a player to steal 2 coins from.',
          buttonText: 'Steal'
        }
      default:
        return {
          title: 'Select Target',
          description: 'Choose a target player.',
          buttonText: 'Select'
        }
    }
  }

  const { title, description, buttonText } = getActionDescription()

  // กรองผู้เล่นที่สามารถเลือกได้ (ไม่รวมตัวเอง และผู้เล่นที่ถูกกำจัดไปแล้ว)
  const availablePlayers = players.filter(player => 
    player !== currentPlayer && !eliminatedPlayers.includes(player)
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      className="sm:max-w-[425px]"
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>

        <div className="grid grid-cols-1 gap-2">
          {availablePlayers.map((player) => (
            <Button
              key={player}
              variant="outline"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => {
                onSelectTarget(player)
                onOpenChange(false)
              }}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{player}</span>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}

export default ActionTargetModal