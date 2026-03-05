'use client'

import { useRef, ReactNode } from 'react'
import { motion, useInView, Variants} from 'framer-motion'

export type RevealVariant =
  | 'slideUp'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomFade'
  | 'flipUp'
  | 'fadeBlur'

interface Props {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  threshold?: number
}

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const VARIANTS: Record<RevealVariant, Variants> = {
  slideUp: {
    hidden: { opacity: 0, y: 60, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -72, skewX: -1.5 },
    visible: { opacity: 1, x: 0, skewX: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 72, skewX: 1.5 },
    visible: { opacity: 1, x: 0, skewX: 0 },
  },
  zoomFade: {
    hidden: { opacity: 0, scale: 0.88, filter: 'blur(8px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  },
  flipUp: {
    hidden: {
      opacity: 0,
      rotateX: 14,
      y: 40,
      transformPerspective: 900,
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transformPerspective: 900,
    },
  },
  fadeBlur: {
    hidden: { opacity: 0, filter: 'blur(14px)', y: 24 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
  },
}

const DURATIONS: Record<RevealVariant, number> = {
  slideUp: 0.8,
  slideLeft: 0.75,
  slideRight: 0.75,
  zoomFade: 0.7,
  flipUp: 0.72,
  fadeBlur: 0.68,
}

export default function SectionReveal({
  children,
  variant = 'slideUp',
  delay = 0,
  threshold = 0.08,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

const offset = Math.round(threshold * 200)

const inView = useInView(ref, {
  once: true,
  margin: `-${offset}px 0px -${offset}px 0px` as `${number}px ${number}px ${number}px ${number}px`,
})

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={VARIANTS[variant]}
      transition={{
        duration: DURATIONS[variant],
        delay,
        ease: EASE_EXPO,
      }}
    >
      {children}
    </motion.div>
  )
}