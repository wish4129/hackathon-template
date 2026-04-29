import type { DeckItem } from "@/lib/deck-data"

interface SwipeCardProps {
  item: DeckItem
}

export function SwipeCard({ item }: SwipeCardProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-foreground/10 select-none">
      <img
        src={item.image}
        alt={item.name}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 text-white">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold tracking-tight">{item.name}</h2>
          <span className="text-2xl font-light opacity-90">{item.age}</span>
        </div>
        <p className="mt-1 text-sm opacity-90">{item.blurb}</p>
      </div>
    </div>
  )
}
