import React from 'react'
import BaseModal from './BaseModal'
import { Button } from '@/components/ui/button'

const ChallengeModal = ({
  isOpen,
  onOpenChange,
  challengedPlayer,
  claimedCard,
  onConfirm,
  onSkip
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Challenge Action"
      className="sm:max-w-[425px]"
    >
      <div className="flex flex-col gap-6">
        <div className="text-center space-y-2">
          <p className="text-lg">
            <span className="font-semibold text-primary">{challengedPlayer}</span> claims to have a{' '}
            <span className="font-semibold text-primary">{claimedCard}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Do you want to challenge this claim?
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onSkip}
          >
            Skip Challenge
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Challenge
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}

export default ChallengeModal