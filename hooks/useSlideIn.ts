// useSlideIn — reusable slide animation variants for section components
// Used with framer-motion: initial / animate / transition

export type SlideDir = 'up' | 'down' | 'left' | 'right' | 'scale'

export interface SlideVariants {
  hidden: Record<string, number>
  visible: Record<string, number | string>
}

export const slideVariants = (dir: SlideDir = 'up', distance = 40): SlideVariants => {
  const offsets: Record<SlideDir, Record<string, number>> = {
    up:    { opacity: 0, y:  distance },
    down:  { opacity: 0, y: -distance },
    left:  { opacity: 0, x:  distance },
    right: { opacity: 0, x: -distance },
    scale: { opacity: 0, scale: 0.92 },
  }
  return {
    hidden:  offsets[dir],
    visible: { opacity: 1, y: 0, x: 0, scale: 1 },
  }
}

export const springTransition = (delay = 0) => ({
  duration: 0.65,
  delay,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
})

// Stagger children: parent controls child delays
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden:  {},
  visible: { transition: { staggerChildren, delayChildren } },
})
