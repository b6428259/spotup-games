import React, { useState } from 'react'
import BaseModal from '@/components/common/BaseModal'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import '../../../components/common/global.css'

const CardReveal = ({ card, cardImage, backCard }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div 
      className="relative w-32 h-48 cursor-pointer preserve-3d"
      style={{ perspective: '1000px' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="w-full h-full absolute backface-hidden"
        animate={{ 
          rotateY: isHovered ? 180 : 0,
        }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={backCard}
          alt="Card Back"
          className="w-full h-full object-cover rounded-lg"
        />
      </motion.div>
      <motion.div
        className="w-full h-full absolute backface-hidden"
        initial={{ rotateY: -180 }}
        animate={{ 
          rotateY: isHovered ? 0 : -180,
        }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={cardImage}
          alt={card}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center">
          {card}
        </div>
      </motion.div>
    </motion.div>
  )
}

const InitialCardsModal = ({
  isOpen,
  onOpenChange,
  playerCards = [],
  cardImages,
  backCard, // รับ prop backCard เพิ่มเติม
}) => {
  if (!playerCards?.length) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Your Initial Cards"
      className="sm:max-w-[500px]"
    >
      <div className="flex flex-col gap-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Hover over cards to reveal them. Keep them secret!
          </p>
          
          <div className="flex justify-center gap-4">
            {playerCards.map((card, index) => (
              <CardReveal
                key={`${card}-${index}`}
                card={card}
                cardImage={cardImages[card]}
                backCard={backCard}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={() => onOpenChange(false)}>
            Start Playing
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}

export default InitialCardsModal