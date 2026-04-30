"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface StatsCardProps {
  questionId: string
}

interface StatOption {
  optionId: string
  text: string
  yes: number
  total: number
  percent: number
}

export function StatsCard({ questionId }: StatsCardProps) {
  const [stats, setStats] = useState<StatOption[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/questions/${questionId}/stats`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.error) setError(data.error)
        else setStats(data.options)
      })
      .catch(() => !cancelled && setError("failed to load"))
    return () => {
      cancelled = true
    }
  }, [questionId])

  useEffect(() => {
    if (!stats) return
    setAnimated(false)
    const id = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(id)
  }, [stats])

  return (
    <Card className="hide-scrollbar h-full w-full overflow-y-auto rounded-3xl border-0 bg-secondary p-6 text-secondary-foreground shadow-2xl">
      <h3 className="mb-1 text-lg font-semibold">Results</h3>
      <p className="mb-6 text-sm text-secondary-foreground/70">
        Share of all YES votes across options
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!stats && !error && (
        <p className="text-sm text-secondary-foreground/70">Loading…</p>
      )}

      {stats && (
        <div className="space-y-4">
          {stats.map((s) => (
            <div key={s.optionId}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-medium">{s.text}</span>
                <span className="text-sm tabular-nums text-secondary-foreground/70">
                  {s.percent}%{" "}
                  <span className="text-xs">
                    ({s.yes}/{s.total})
                  </span>
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-black/15">
                <div
                  className="stats-bar-fill h-full rounded-full"
                  style={{ width: `${animated ? s.percent : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
