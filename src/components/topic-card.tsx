import Link from "next/link"
import { Card } from "@/components/ui/card"

interface TopicCardProps {
  id: string
  name: string
  emoji: string
  questionCount: number
  index: number
}

const STYLES = [
  {
    bg: "bg-gradient-to-br from-secondary via-secondary to-amber-300 text-black",
    muted: "text-black/60",
  },
  {
    bg: "bg-gradient-to-br from-white via-white to-neutral-200 text-black",
    muted: "text-black/60",
  },
  {
    bg: "bg-gradient-to-br from-card via-neutral-800 to-black text-white border border-white/20",
    muted: "text-white/60",
  },
]

export function TopicCard({ id, name, emoji, questionCount, index }: TopicCardProps) {
  const { bg, muted } = STYLES[index % STYLES.length]

  return (
    <Link
      href={`/topics/${id}`}
      className="mb-3 block break-inside-avoid"
    >
      <Card
        className={`h-40 ${bg} p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xl hover:shadow-2xl ring-1 ring-black/10`}
      >
        <div className="text-4xl">{emoji}</div>
        <div>
          <h3 className="font-semibold text-base leading-tight mb-1">{name}</h3>
          <p className={`text-xs ${muted}`}>
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </p>
        </div>
      </Card>
    </Link>
  )
}
