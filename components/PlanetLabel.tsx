'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanet } from '@/context/PlanetContext'

// ─────────────────────────────────────────────────────────────────────────────
//  PlanetLabel — rendered INSIDE the #hero section as position:absolute
//
//  Because it's a child of the hero section (in normal document flow),
//  it scrolls naturally with the page — no fixed positioning, no scroll hacks.
//  It fades out when the hero section scrolls out of view.
//
//  Desktop only — hidden on mobile via CSS media query.
//
//  Horizontal position mirrors the Three.js planet centre:
//    planet X = tan(25°)×22×0.40 world units right of screen centre
//    → ≈ 70 % of viewport width
//  Vertical: near top of hero section, above the planet sphere.
// ─────────────────────────────────────────────────────────────────────────────

// Mirrors PLANET_CX_FRAC used in SkillOverlay / Three.js positioning
const PLANET_CX_FRAC = 0.70   // fraction of viewport width

export default function PlanetLabel() {
  const { current, switching } = usePlanet()

  // Update displayed planet only after exit phase completes (420 ms)
  const [displayed, setDisplayed] = useState(current)
  const switchTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!switching) { setDisplayed(current); return }
    clearTimeout(switchTimer.current)
    switchTimer.current = setTimeout(() => setDisplayed(current), 420)
    return () => clearTimeout(switchTimer.current)
  }, [switching, current])

  const p = displayed

  return (
    <>
      <style>{`
        @media (max-width: 768px) { .planet-label-root { display: none !important; } }
      `}</style>

      {/*
        position:absolute within #hero so it scrolls with the section.
        left uses vw units so it always aligns to the planet, independent
        of the section's own padding/max-width.
        top: positioned well above the planet centre (~12 % of vh).
      */}
      <div
        className="planet-label-root"
        style={{
          position:      'absolute',
          left:          `${PLANET_CX_FRAC * 105}vw`,
          top:           '10vh',
          transform:     'translateX(-50%)',
          textAlign:     'center',
          maxWidth:      '340px',
          pointerEvents: 'none',
          zIndex:        5,
        }}
      >
        <AnimatePresence mode="wait">
          {!switching && (
            <motion.div
              key={`pl-${p.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <div style={{
                fontFamily:    'Syne, sans-serif',
                fontWeight:    700,
                fontSize:      'clamp(0.75rem, 1.1vw, 0.95rem)',
                color:         p.color,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom:  '5px',
                textShadow:    `0 0 22px ${p.color}55`,
              }}>
                {p.title}
              </div>
              <div style={{
                fontFamily:  '"DM Sans", sans-serif',
                fontStyle:   'italic',
                fontSize:    'clamp(0.70rem, 1vw, 0.85rem)',
                color:       'rgba(226,232,240,0.62)',
                lineHeight:  1.55,
              }}>
                {p.slogan}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}