'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

/**
 * How this works:
 * - This sits as its own block directly AFTER the (completely untouched) About
 *   section and BEFORE Skills.
 * - The About section above scrolls exactly as it always has — nothing about
 *   it is modified.
 * - Once About has scrolled out of view and this block's wrapper enters the
 *   scroll range, its inner panel becomes `position: sticky` and pins for an
 *   extended scroll distance. During that pin, the poster image slides in
 *   from the right, holds centred on screen, then slides/fades out as the
 *   wrapper's extra height is exhausted — at which point it un-pins and the
 *   next section (Skills) continues scrolling up normally underneath it.
 * - Everything is driven by real scroll position (useScroll + sticky), not
 *   wheel-event scroll-jacking, so it stays smooth and native-feeling on
 *   touch/mobile too.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function AboutPosterReveal() {
  const wrapRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  })

  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  })

  // Phase map across the pin's scroll range:
  // 0.00 – 0.22  poster slides in from the right, fades in
  // 0.22 – 0.68  poster holds, fully visible, centred
  // 0.68 – 1.00  poster eases out to the left and fades, handing off to next section
  const xRaw   = useTransform(progress, [0, 0.22, 0.68, 1], [42, 0, 0, -34])
  const x      = useTransform(xRaw, (v) => `${v}%`)
  const opacity = useTransform(progress, [0, 0.16, 0.72, 1], [0, 1, 1, 0])
  const scale   = useTransform(progress, [0, 0.22, 0.68, 1], [0.90, 1, 1, 0.95])
  const rotate  = useTransform(progress, [0, 0.22, 0.68, 1], [4, 0, 0, -3])

  // Label / eyebrow text fades in slightly after the poster starts arriving
  const labelOpacity = useTransform(progress, [0.06, 0.22, 0.68, 0.82], [0, 1, 1, 0])
  const labelY        = useTransform(progress, [0.06, 0.22], [16, 0])

  return (
    <div ref={wrapRef} style={{ position: 'relative', height: '230vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 clamp(1.25rem, 5vw, 3rem)',
        }}
      >
        {/* ambient wash behind the poster */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(99,102,241,0.10) 0%, transparent 62%)',
              'radial-gradient(ellipse 45% 40% at 78% 75%, rgba(6,182,212,0.07) 0%, transparent 58%)',
            ].join(','),
          }}
        />

        <motion.span
          style={{
            opacity: labelOpacity,
            y: labelY,
            fontFamily: '"JetBrains Mono",monospace', fontSize: '0.70rem',
            letterSpacing: '0.28em', textTransform: 'uppercase', color: '#06b6d4',
            marginBottom: '20px', display: 'block', position: 'relative', zIndex: 1,
          }}
        >
          
        </motion.span>

        <motion.div
          style={{
            x, opacity, scale, rotate,
            willChange: 'transform, opacity',
            position: 'relative',
            width: 'min(100%, 900px)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(99,102,241,0.22)',
            boxShadow: '0 30px 90px -24px rgba(99,102,241,0.40)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/poster_linkedin.png"
            alt="Rutik Yadav — Java Backend Developer, Spring Boot Developer"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
          />
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), transparent 45%)',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
