"use client"

import {
  forwardRef,
  useImperativeHandle,
} from "react"
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion"

interface SwipeCardProps {
  text: string
  stackIndex: number
  onSwipe: (value: boolean) => void
}

export interface SwipeCardHandle {
  animateExit: (value: boolean, onDone: () => void) => void
}

const SWIPE_THRESHOLD = 120

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ text, stackIndex, onSwipe }, ref) {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14])
    const yesOpacity = useTransform(x, [0, 60, 140], [0, 0.6, 1])
    const noOpacity = useTransform(x, [-140, -60, 0], [1, 0.6, 0])

    const handleDragEnd = (_: unknown, info: PanInfo) => {
      if (info.offset.x > SWIPE_THRESHOLD) {
        onSwipe(true)
      } else if (info.offset.x < -SWIPE_THRESHOLD) {
        onSwipe(false)
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        animateExit: (value, onDone) => {
          animate(x, value ? 600 : -600, {
            duration: 0.25,
            onComplete: onDone,
          })
        },
      }),
      [x],
    )

    const isTop = stackIndex === 0
    const scale = 1 - stackIndex * 0.07
    const yOffset = stackIndex * 20

    return (
      <motion.div
        className="absolute inset-0"
        style={{
          x: isTop ? x : 0,
          rotate: isTop ? rotate : 0,
          zIndex: 100 - stackIndex,
          touchAction: "pan-y",
        }}
        animate={{ scale, y: yOffset }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={isTop ? handleDragEnd : undefined}
        exit={{
          opacity: 0,
          transition: { duration: 0.2 },
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-2xl select-none">
          <div className="flex h-full w-full items-center justify-center p-8 text-center">
            <p className="text-3xl font-bold leading-snug tracking-tight text-zinc-900">
              {text}
            </p>
          </div>

          <motion.div
            className="absolute top-6 left-6 rounded-lg border-[3px] border-red-500 bg-white/90 px-3 py-1 text-2xl font-extrabold text-red-500 -rotate-12"
            style={{ opacity: noOpacity }}
          >
            NO
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 rounded-lg border-[3px] border-green-500 bg-white/90 px-3 py-1 text-2xl font-extrabold text-green-500 rotate-12"
            style={{ opacity: yesOpacity }}
          >
            YES
          </motion.div>
        </div>
      </motion.div>
    )
  },
)
