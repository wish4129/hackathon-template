"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Star,
  X,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import {
  SwipeDeck,
  type SwipeDeckHandle,
  type SwipeDeckStage,
} from "@/components/swipe-deck"

interface Question {
  id: string
  title: string
  options: { id: string; text: string }[]
  votedIds: string[]
  favorited: boolean
}

interface QuestionFeedProps {
  questions: Question[]
  topicName: string
  topicEmoji: string
}

export function QuestionFeed({
  questions,
  topicName,
  topicEmoji,
}: QuestionFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const deckRefs = useRef(new Map<string, SwipeDeckHandle | null>())
  const router = useRouter()
  const searchParams = useSearchParams()
  const qParam = searchParams.get("q")

  const initialActiveId = qParam ?? questions[0]?.id ?? ""
  const [activeId, setActiveId] = useState(initialActiveId)

  const [favorites, setFavorites] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.favorited])),
  )

  const [stages, setStages] = useState<Record<string, SwipeDeckStage>>({})

  const activeQuestion = useMemo(
    () => questions.find((q) => q.id === activeId) ?? questions[0],
    [activeId, questions],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (qParam) {
      const target = container.querySelector<HTMLElement>(
        `[data-question-id="${qParam}"]`,
      )
      if (target) target.scrollIntoView({ behavior: "instant", block: "start" })
    }
  }, [qParam])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (!visible) return
        const id = (visible.target as HTMLElement).dataset.questionId
        if (!id) return
        setActiveId(id)
        if (id === qParam) return
        const params = new URLSearchParams(searchParams.toString())
        params.set("q", id)
        router.replace(`?${params.toString()}`, { scroll: false })
      },
      { root: container, threshold: 0.6 },
    )

    const sections = container.querySelectorAll("[data-question-id]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [qParam, router, searchParams])

  const dispatchSwipe = (value: boolean) => {
    if (!activeQuestion) return
    deckRefs.current.get(activeQuestion.id)?.swipe(value)
  }

  const dispatchRetry = () => {
    if (!activeQuestion) return
    deckRefs.current.get(activeQuestion.id)?.retry()
  }

  const scrollToNextQuestion = () => {
    if (!activeQuestion) return
    const idx = questions.findIndex((q) => q.id === activeQuestion.id)
    const next = questions[idx + 1]
    const container = containerRef.current
    if (!next || !container) return
    const target = container.querySelector<HTMLElement>(
      `[data-question-id="${next.id}"]`,
    )
    target?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const toggleFavorite = async () => {
    if (!activeQuestion) return
    const id = activeQuestion.id
    const next = !favorites[id]
    setFavorites((prev) => ({ ...prev, [id]: next }))
    try {
      const res = await fetch(`/api/questions/${id}/favorite`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("failed")
      const data = (await res.json()) as { favorited: boolean }
      setFavorites((prev) => ({ ...prev, [id]: data.favorited }))
    } catch {
      setFavorites((prev) => ({ ...prev, [id]: !next }))
    }
  }

  const isActiveFavorited = activeQuestion
    ? !!favorites[activeQuestion.id]
    : false

  const activeStage: SwipeDeckStage = activeQuestion
    ? stages[activeQuestion.id] ?? "cards"
    : "cards"
  const showSwipeButtons = activeStage !== "stats"

  if (!activeQuestion) return null

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-background">
      <Navbar
        user={null}
        authEnabled={false}
        left={
          <Link
            href="/topics"
            aria-label="Back to topics"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </Link>
        }
        center={
          <p className="truncate text-sm font-semibold text-white">
            {topicEmoji} {topicName}
          </p>
        }
      />

      <div
        ref={containerRef}
        className="hide-scrollbar flex-1 min-h-0 snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {questions.map((q) => (
          <section
            key={q.id}
            data-question-id={q.id}
            className="flex h-full w-full snap-start flex-col px-5 py-5 sm:px-8"
          >
            <h2 className="mb-5 shrink-0 text-center">
              <span className="inline-block max-w-full rounded-2xl bg-secondary px-4 py-2 text-xl font-bold leading-tight tracking-tight text-secondary-foreground shadow-lg sm:text-2xl md:text-3xl">
                {q.title}
              </span>
            </h2>
            <div className="flex-1 min-h-0">
              <SwipeDeck
                ref={(handle) => {
                  if (handle) deckRefs.current.set(q.id, handle)
                  else deckRefs.current.delete(q.id)
                }}
                questionId={q.id}
                options={q.options}
                initialVotedIds={q.votedIds}
                onStageChange={(stage) =>
                  setStages((prev) =>
                    prev[q.id] === stage ? prev : { ...prev, [q.id]: stage },
                  )
                }
              />
            </div>
          </section>
        ))}
      </div>

      <div className="shrink-0 flex items-center justify-center gap-5 py-5">
        {showSwipeButtons ? (
          <button
            type="button"
            onClick={() => dispatchSwipe(false)}
            aria-label="No"
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500 bg-white text-red-500 shadow-md transition hover:bg-red-50 active:scale-95"
          >
            <X className="h-6 w-6" strokeWidth={3} />
          </button>
        ) : (
          <button
            type="button"
            onClick={dispatchRetry}
            aria-label="Retry"
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-orange-500 bg-white text-orange-500 shadow-md transition hover:bg-orange-50 active:scale-95"
          >
            <RotateCcw className="h-6 w-6" strokeWidth={2.5} />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur()
            toggleFavorite()
          }}
          aria-label={isActiveFavorited ? "Unfavorite" : "Favorite"}
          aria-pressed={isActiveFavorited}
          style={{
            outline: "none",
            boxShadow: "none",
            appearance: "none",
            WebkitAppearance: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary transition-colors hover:bg-yellow-50 focus:outline-none focus-visible:outline-none active:scale-95"
        >
          <Star
            className="h-5 w-5"
            strokeWidth={2.5}
            fill={isActiveFavorited ? "currentColor" : "none"}
          />
        </button>
        {showSwipeButtons ? (
          <button
            type="button"
            onClick={() => dispatchSwipe(true)}
            aria-label="Yes"
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-500 bg-white text-green-500 shadow-md transition hover:bg-green-50 active:scale-95"
          >
            <Check className="h-6 w-6" strokeWidth={3} />
          </button>
        ) : (
          <button
            type="button"
            onClick={scrollToNextQuestion}
            aria-label="Next question"
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-blue-500 shadow-md transition hover:bg-blue-50 active:scale-95"
          >
            <ArrowRight className="h-6 w-6" strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  )
}
