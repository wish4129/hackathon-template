"use client"

import { forwardRef, useImperativeHandle, useState } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddedOption {
  id: string
  text: string
}

interface AddOptionCardProps {
  questionId: string
  onAdded: (option: AddedOption) => void
  onSkip: () => void
}

export interface AddOptionCardHandle {
  swipe: (value: boolean) => void
}

const SWIPE_THRESHOLD = 120

export const AddOptionCard = forwardRef<
  AddOptionCardHandle,
  AddOptionCardProps
>(function AddOptionCard({ questionId, onAdded, onSkip }, ref) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14])
  const yesOpacity = useTransform(x, [0, 60, 140], [0, 0.6, 1])
  const noOpacity = useTransform(x, [-140, -60, 0], [1, 0.6, 0])

  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const animateOff = (dir: 1 | -1, onDone: () => void) => {
    animate(x, dir * 600, { duration: 0.25, onComplete: onDone })
  }

  const doSkip = () => animateOff(-1, onSkip)

  const doAdd = async () => {
    if (submitting) return
    const trimmed = text.trim()
    if (!trimmed) {
      doSkip()
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/questions/${questionId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "failed to add")
      animateOff(1, () => onAdded(data.option as AddedOption))
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to add")
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
      setSubmitting(false)
    }
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      void doAdd()
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      doSkip()
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      swipe: (value) => {
        if (value) void doAdd()
        else doSkip()
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, submitting],
  )

  const stopDrag = (e: React.PointerEvent) => {
    e.stopPropagation()
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, touchAction: "pan-y" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border-2 border-dashed border-zinc-300 bg-white p-6 shadow-2xl select-none">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Plus className="h-7 w-7" strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">
              Add your own option
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Missing something? Suggest it — it counts as a YES.
            </p>
          </div>
          <div
            className="w-full space-y-3"
            onPointerDown={stopDrag}
            onPointerMove={stopDrag}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your option…"
              rows={3}
              maxLength={140}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={doSkip}
                disabled={submitting}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                type="button"
                onClick={() => void doAdd()}
                disabled={submitting}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {submitting ? "Adding…" : "Add"}
              </Button>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute top-6 left-6 rounded-lg border-[3px] border-red-500 bg-white/90 px-3 py-1 text-2xl font-extrabold text-red-500 -rotate-12"
          style={{ opacity: noOpacity }}
        >
          SKIP
        </motion.div>
        <motion.div
          className="absolute top-6 right-6 rounded-lg border-[3px] border-green-500 bg-white/90 px-3 py-1 text-2xl font-extrabold text-green-500 rotate-12"
          style={{ opacity: yesOpacity }}
        >
          ADD
        </motion.div>
      </div>
    </motion.div>
  )
})
