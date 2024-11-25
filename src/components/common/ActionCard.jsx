import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ActionCard = ({ 
  action, 
  playerCoins, 
  onActionSelect,
  disabled
}) => {
  const isAffordable = playerCoins >= action.cost

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 group",
      !isAffordable && "opacity-50"
    )}>
      <div className="aspect-[3/4] relative">
        <img 
          src={action.image} 
          alt={action.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {action.cost > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold px-2 py-1 rounded-full text-sm">
            {action.cost} 💰
          </div>
        )}
        
        {action.character && (
          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-sm">
            {action.character}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg">{action.name}</h3>
        <p className="text-sm text-muted-foreground">
          {action.description}
        </p>
        <Button
          className="w-full"
          onClick={() => onActionSelect(action)}
          disabled={!isAffordable || disabled}
          variant={action.challengeable ? "secondary" : "default"}
        >
          {action.name}
        </Button>
      </div>
    </Card>
  )
}

export default ActionCard