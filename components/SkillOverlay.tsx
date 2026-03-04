'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanet } from '@/context/PlanetContext'

function getAngles(count: number): number[] {
  const start = 200, sweep = 280
  return Array.from({ length: count }, (_, i) =>
    start + (sweep / (Math.max(count - 1, 1))) * i
  )
}
function polar(angleDeg: number, r: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180
  return [Math.cos(a) * r, Math.sin(a) * r]
}

// Lines component tracks viewport size and renders with absolute pixel coords
function SkillLines({ skills, angles, lineLen, color, cxFrac, cyFrac }: {
  skills: string[]; angles: number[]; lineLen: number
  color: string; cxFrac: number; cyFrac: number
}) {
  const [w, setW] = useState(0)
  const [h, setH] = useState(0)
  useEffect(() => {
    const upd = () => { setW(window.innerWidth); setH(window.innerHeight) }
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])
  if (!w || !h) return null
  const cx = w * cxFrac
  const cy = h * cyFrac
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
      {skills.map((_, i) => {
        const [dx, dy] = polar(angles[i], lineLen)
        return (
          <motion.line key={i}
            x1={cx} y1={cy} x2={cx + dx} y2={cy + dy}
            stroke={color} strokeWidth={1.2} strokeLinecap="round"
            initial={{ strokeOpacity: 0 }}
            animate={{ strokeOpacity: 0.52 }}
            exit={{   strokeOpacity: 0 }}
            transition={{ duration: 0.55, delay: 0.08 + i * 0.06, ease: 'easeOut' }}
          />
        )
      })}
    </svg>
  )
}

const PLANET_CX_FRAC = 0.70
const PLANET_CY_FRAC = 0.48
const LINE_LEN       = 195

export default function SkillOverlay() {
  const { current, switching } = usePlanet()

  const [displayed, setDisplayed] = useState(current)
  const switchTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!switching) { setDisplayed(current); return }
    clearTimeout(switchTimer.current)
    switchTimer.current = setTimeout(() => setDisplayed(current), 420)
    return () => clearTimeout(switchTimer.current)
  }, [switching, current])

  const [inHero, setInHero] = useState(true)
  useEffect(() => {
    const hero = document.querySelector('#hero') as HTMLElement | null
    if (!hero) {
      const onScroll = () => setInHero(window.scrollY < window.innerHeight * 0.85)
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
    const obs = new IntersectionObserver(([e]) => setInHero(e.isIntersecting), { threshold: 0.08 })
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  const [meshHit, setMeshHit] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    const onHover = (e: Event) => {
      const { hit } = (e as CustomEvent<{ hit: boolean }>).detail
      clearTimeout(leaveTimer.current)
      if (hit) { setMeshHit(true) }
      else { leaveTimer.current = setTimeout(() => setMeshHit(false), 60) }
    }
    window.addEventListener('planet-hover', onHover)
    return () => { window.removeEventListener('planet-hover', onHover); clearTimeout(leaveTimer.current) }
  }, [])

  useEffect(() => { if (!inHero) setMeshHit(false) }, [inHero])

  const skillsVisible = inHero && meshHit && !switching
  const p      = displayed
  const skills = p.skills
  const angles = getAngles(skills.length)

  return (
    <>
      <style>{`@media (max-width:768px){.skill-overlay-root{display:none!important}}`}</style>
      <div className="skill-overlay-root" style={{
        position: 'fixed', inset: 0, zIndex: 3,
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        <AnimatePresence mode="wait">
          {skillsVisible && (
            <motion.div
              key={`skills-${p.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              transition={{ duration: 0.30, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Lines with real pixel SVG coordinates */}
              <SkillLines
                skills={skills} angles={angles} lineLen={LINE_LEN}
                color={p.color} cxFrac={PLANET_CX_FRAC} cyFrac={PLANET_CY_FRAC}
              />

              {/* Skill pills — CSS calc() is fine for div positioning */}
              {skills.map((skill, i) => {
                const [dx, dy] = polar(angles[i], LINE_LEN + 12)
                const isRight  = Math.cos(angles[i] * Math.PI / 180) >= 0
                const isAbove  = Math.sin(angles[i] * Math.PI / 180) < -0.3
                const isBelow  = Math.sin(angles[i] * Math.PI / 180) >  0.3
                return (
                  <motion.div
                    key={`${p.id}-sk-${i}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{   opacity: 0, scale: 0.90 }}
                    transition={{ duration: 0.32, delay: 0.08 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position:             'absolute',
                      left:                 `calc(${PLANET_CX_FRAC * 100}% + ${dx}px)`,
                      top:                  `calc(${PLANET_CY_FRAC * 100}% + ${dy}px)`,
                      transform:            `translate(${isRight ? '0' : '-100%'}, ${isAbove ? '0' : isBelow ? '-100%' : '-50%'})`,
                      padding:              '4px 11px',
                      borderRadius:         '20px',
                      background:           'rgba(4,8,26,0.84)',
                      backdropFilter:       'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border:               `1px solid ${p.color}50`,
                      boxShadow:            `0 0 12px ${p.color}18`,
                      color:                p.color,
                      fontSize:             'clamp(0.60rem,0.85vw,0.72rem)',
                      fontFamily:           '"JetBrains Mono",monospace',
                      fontWeight:           500,
                      letterSpacing:        '0.04em',
                      whiteSpace:           'nowrap',
                      pointerEvents:        'none',
                    }}
                  >
                    {skill}
                  </motion.div>
                )
              })}

              {/* Centre dot */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{   scale: 0, opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.02 }}
                style={{
                  position:      'absolute',
                  left:          `${PLANET_CX_FRAC * 100}%`,
                  top:           `${PLANET_CY_FRAC * 100}%`,
                  transform:     'translate(-50%,-50%)',
                  width: 7, height: 7, borderRadius: '50%',
                  background:    p.color,
                  boxShadow:     `0 0 10px ${p.color}, 0 0 22px ${p.color}88`,
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}