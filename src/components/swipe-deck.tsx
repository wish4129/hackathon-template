"use client"

import { useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion"
import { Button } from "@/components/ui/button"
import { SwipeCard } from "@/components/swipe-card"
import { MOCK_DECK, type DeckItem } from "@/lib/deck-data"

const SWIPE_THRESHOLD = 120
const VELOCITY_THRESHOLD = 500

function handleLike(item: DeckItem) {
  console.log("[swipe] LIKE", item.id, item.name)
}

function handlePass(item: DeckItem) {
  console.log("[swipe] PASS", item.id, item.name)
}

export function SwipeDeck() {
  const [index, setIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20])
  const likeOpacity = useTransform(x, [40, 140], [0, 1])
  const passOpacity = useTransform(x, [-140, -40], [1, 0])

  const current = MOCK_DECK[index]
  const next = MOCK_DECK[index + 1]
  const done = index >= MOCK_DECK.length

  function commit(direction: "left" | "right") {
    if (!current) return
    if (direction === "right") handleLike(current)
    else handlePass(current)
    setExitDirection(direction)
  }

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const { offset, velocity } = info
    if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      commit("right")
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      commit("left")
    }
  }

  function onExitComplete() {
    setIndex((i) => i + 1)
    setExitDirection(null)
    x.set(0)
  }

  function reset() {
    setIndex(0)
    setExitDirection(null)
    x.set(0)
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
      <div className="relative aspect-[3/4] w-full">
        {done ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-card text-center ring-1 ring-foreground/10">
            <p className="text-lg font-medium">You&apos;ve seen everyone.</p>
            <p className="text-sm text-muted-foreground">Reshuffle the deck?</p>
            <Button onClick={reset}>Start over</Button>
          </div>
        ) : (
          <>
            {next && (
              <div className="absolute inset-0 scale-95 opacity-70">
                <SwipeCard item={next} />
              </div>
            )}
            <AnimatePresence onExitComplete={onExitComplete}>
              {current && !exitDirection && (
                <motion.div
                  key={current.id}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  style={{ x, rotate }}
                  drag="x"
                  dragElastic={0.6}
                  onDragEnd={onDragEnd}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <SwipeCard item={current} />
                  <motion.div
                    style={{ opacity: likeOpacity }}
                    className="pointer-events-none absolute top-6 left-6 rounded-md border-4 border-green-500 px-3 py-1 text-2xl font-bold text-green-500 -rotate-12"
                  >
                    LIKE
                  </motion.div>
                  <motion.div
                    style={{ opacity: passOpacity }}
                    className="pointer-events-none absolute top-6 right-6 rounded-md border-4 border-red-500 px-3 py-1 text-2xl font-bold text-red-500 rotate-12"
                  >
                    NOPE
                  </motion.div>
                </motion.div>
              )}
              {current && exitDirection && (
                <motion.div
                  key={`${current.id}-exit`}
                  className="absolute inset-0"
                  initial={{ x: x.get(), rotate: rotate.get() }}
                  animate={{
                    x: exitDirection === "right" ? 600 : -600,
                    rotate: exitDirection === "right" ? 30 : -30,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <SwipeCard item={current} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {!done && (
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => commit("left")}
            disabled={!!exitDirection}
            className="h-14 w-14 rounded-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
          >
            <span className="text-2xl">✕</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => commit("right")}
            disabled={!!exitDirection}
            className="h-14 w-14 rounded-full border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-500"
          >
            <span className="text-2xl">♥</span>
          </Button>
        </div>
      )}
    </div>
  )
}
