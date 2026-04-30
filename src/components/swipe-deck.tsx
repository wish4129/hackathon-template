"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { AnimatePresence } from "framer-motion"
import { SwipeCard, type SwipeCardHandle } from "@/components/swipe-card"
import { StatsCard } from "@/components/stats-card"
import {
  AddOptionCard,
  type AddOptionCardHandle,
} from "@/components/add-option-card"

interface Option {
  id: string
  text: string
}

export type SwipeDeckStage = "cards" | "add" | "stats"

interface SwipeDeckProps {
  questionId: string
  options: Option[]
  initialVotedIds: string[]
  onExhausted?: () => void
  onStageChange?: (stage: SwipeDeckStage) => void
}

export interface SwipeDeckHandle {
  swipe: (value: boolean) => void
  hasRemaining: () => boolean
  retry: () => void
}

export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(
  function SwipeDeck(
    { questionId, options, initialVotedIds, onStageChange },
    ref,
  ) {
    const fullyVoted =
      options.length > 0 && options.every((o) => initialVotedIds.includes(o.id))
    const topCardRef = useRef<SwipeCardHandle>(null)
    const addCardRef = useRef<AddOptionCardHandle>(null)
    const [remaining, setRemaining] = useState<Option[]>(
      fullyVoted ? [] : options,
    )
    const [addStage, setAddStage] = useState<"pending" | "done">(
      fullyVoted ? "done" : "pending",
    )
    const [statsReloadKey, setStatsReloadKey] = useState(0)

    const stage: SwipeDeckStage =
      remaining.length > 0 ? "cards" : addStage === "pending" ? "add" : "stats"

    useEffect(() => {
      onStageChange?.(stage)
    }, [stage, onStageChange])

    const commitSwipe = (value: boolean) => {
      const [swiped, ...rest] = remaining
      if (!swiped) return
      setRemaining(rest)
      void fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: swiped.id, value }),
      })
    }

    useImperativeHandle(
      ref,
      () => ({
        swipe: (value) => {
          if (remaining.length === 0 && addStage === "pending") {
            addCardRef.current?.swipe(value)
            return
          }
          if (remaining.length === 0) return
          const card = topCardRef.current
          if (card) {
            card.animateExit(value, () => commitSwipe(value))
          } else {
            commitSwipe(value)
          }
        },
        hasRemaining: () => remaining.length > 0,
        retry: () => {
          setRemaining(options)
          setAddStage("pending")
        },
      }),
      [remaining, addStage, options],
    )

    if (remaining.length === 0 && addStage === "pending") {
      return (
        <div className="relative mx-auto h-full w-full max-w-sm">
          <AddOptionCard
            ref={addCardRef}
            questionId={questionId}
            onSkip={() => setAddStage("done")}
            onAdded={() => {
              setAddStage("done")
              setStatsReloadKey((k) => k + 1)
            }}
          />
        </div>
      )
    }

    if (remaining.length === 0) {
      return (
        <div className="mx-auto h-full w-full max-w-sm">
          <StatsCard key={statsReloadKey} questionId={questionId} />
        </div>
      )
    }

    const visible = remaining.slice(0, 3)

    return (
      <div className="relative mx-auto h-full w-full max-w-sm">
        <AnimatePresence initial={false}>
          {visible
            .slice()
            .reverse()
            .map((opt, revIdx) => {
              const stackIndex = visible.length - 1 - revIdx
              const isTop = stackIndex === 0
              return (
                <SwipeCard
                  key={opt.id}
                  ref={isTop ? topCardRef : undefined}
                  text={opt.text}
                  stackIndex={stackIndex}
                  onSwipe={commitSwipe}
                />
              )
            })}
        </AnimatePresence>
      </div>
    )
  },
)
