'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanet, PLANETS } from '@/context/PlanetContext'

// ─────────────────────────────────────────────────────────────────────────────
//  PlanetSelector — rendered INSIDE #hero as position:absolute
//
//  • Centred vertically within the hero section via top:50% + translateY(-50%)
//  • Scrolls naturally away when hero scrolls out of view (no IntersectionObserver needed)
//  • Hero has overflow:hidden so this is clipped cleanly as the section leaves viewport
//  • Desktop only (hidden ≤ 768 px via CSS)
// ─────────────────────────────────────────────────────────────────────────────

const SWITCH_DUR = 1620

export default function PlanetSelector() {
  const { current, select, switching } = usePlanet()
  const [open,    setOpen] = useState(false)
  const [hovered, setHov]  = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openPanel  = () => { clearTimeout(closeTimer.current); setOpen(true) }
  const closePanel = () => { closeTimer.current = setTimeout(() => setOpen(false), 300) }
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const hovPlanet = hovered ? PLANETS.find(p => p.id === hovered) ?? null : null

  return (
    <>
      <style>{`
        @media (max-width: 768px) { .planet-sel-root { display: none !important; } }
      `}</style>

      {/*
        position:absolute inside #hero (which is position:relative).
        top:50% + translateY(-50%) centres it within the hero section height.
        right:20px keeps it pinned to the right edge.
        This is NOT fixed — it scrolls away naturally with the hero section.
        overflow:hidden on #hero clips it when the section leaves the viewport.
      */}
      <div
        className="planet-sel-root"
        style={{
          position:  'absolute',
          right:     '20px',
          top:       '50%',
          transform: 'translateY(-50%)',
          zIndex:    20,
          display:   'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'auto',
        }}
        onMouseEnter={openPanel}
        onMouseLeave={closePanel}
      >
        {/* ── Info card ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {open && hovPlanet && (
            <motion.div
              key={`card-${hovPlanet.id}`}
              initial={{ opacity:0, x:18, scale:0.93 }}
              animate={{ opacity:1, x:0,  scale:1 }}
              exit={{   opacity:0, x:14, scale:0.93 }}
              transition={{ duration:0.20, ease:[0.22,1,0.36,1] }}
              style={{
                position:  'absolute',
                right:     '54px',
                top:       '50%',
                transform: 'translateY(-50%)',
                width:     '210px',
                padding:   '14px 16px',
                borderRadius: '16px',
                background:   'rgba(4,8,26,0.94)',
                backdropFilter:       'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border:    `1px solid ${hovPlanet.color}40`,
                boxShadow: `0 8px 36px rgba(0,0,0,0.55), 0 0 28px ${hovPlanet.color}18`,
                pointerEvents: 'none',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <span style={{ fontSize:'1.4rem', lineHeight:1 }}>{hovPlanet.symbol}</span>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.90rem', color:hovPlanet.color }}>
                    {hovPlanet.label}
                  </div>
                  <div style={{ fontSize:'0.62rem', color:'#475569', fontFamily:'"JetBrains Mono",monospace' }}>
                    {hovPlanet.title.split('—')[1]?.trim() ?? hovPlanet.title}
                  </div>
                </div>
              </div>
              <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'8px 0' }} />
              <p style={{ margin:0, fontSize:'0.66rem', lineHeight:1.55, color:'#94a3b8', fontFamily:'"DM Sans",sans-serif' }}>
                <span style={{ color:hovPlanet.color, marginRight:'5px' }}>💡</span>
                {hovPlanet.slogan}
              </p>
              <div style={{ marginTop:'8px', display:'flex', flexWrap:'wrap', gap:'4px' }}>
                {hovPlanet.skills.slice(0,3).map(s => (
                  <span key={s} style={{
                    padding:'2px 7px', borderRadius:'10px', fontSize:'0.58rem',
                    background:`${hovPlanet.color}18`, color:hovPlanet.color,
                    border:`1px solid ${hovPlanet.color}30`,
                    fontFamily:'"JetBrains Mono",monospace',
                  }}>{s}</span>
                ))}
                {hovPlanet.skills.length > 3 && (
                  <span style={{ fontSize:'0.58rem', color:'#475569', padding:'2px 4px' }}>
                    +{hovPlanet.skills.length-3}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pill ──────────────────────────────────────────────────── */}
        <motion.div
          animate={{ width: open ? 46 : 38 }}
          transition={{ duration:0.24, ease:[0.22,1,0.36,1] }}
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            '6px',
            padding:        '10px 0',
            borderRadius:   '26px',
            background:     'rgba(4,8,26,0.82)',
            backdropFilter:       'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border:         '1px solid rgba(255,255,255,0.07)',
            boxShadow:      '0 10px 40px rgba(0,0,0,0.50)',
            overflow:       'hidden',
          }}
        >
          {/* Header label */}
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity:0, height:0 }}
                animate={{ opacity:1, height:'auto' }}
                exit={{   opacity:0, height:0 }}
                transition={{ duration:0.18 }}
                style={{
                  fontSize:     '0.50rem',
                  color:        '#334155',
                  fontFamily:   '"JetBrains Mono",monospace',
                  textTransform:'uppercase',
                  letterSpacing:'0.12em',
                  paddingBottom:'2px',
                  userSelect:   'none',
                  whiteSpace:   'nowrap',
                }}
              >SOLAR SYS</motion.span>
            )}
          </AnimatePresence>

          {/* Planet dots */}
          {PLANETS.map(p => {
            const isActive = p.id === current.id
            const isHov    = hovered === p.id
            const isSw     = isActive && switching
            return (
              <motion.button
                key={p.id}
                title={p.label}
                onClick={() => { select(p.id); setOpen(false) }}
                onMouseEnter={() => setHov(p.id)}
                onMouseLeave={() => setHov(null)}
                whileTap={{ scale:0.82 }}
                animate={{
                  width:  isActive ? 30 : open ? 23 : 18,
                  height: isActive ? 30 : open ? 23 : 18,
                  scale:  isSw ? [1,0.78,1] : 1,
                }}
                transition={{
                  width:  { duration:0.26, ease:[0.22,1,0.36,1] },
                  height: { duration:0.26, ease:[0.22,1,0.36,1] },
                  scale:  isSw ? { duration:1.6, ease:'easeInOut' } : { duration:0.26 },
                }}
                style={{
                  padding:0, border:'none', borderRadius:'50%',
                  cursor:'pointer', flexShrink:0, position:'relative',
                  background: isSw
                    ? `radial-gradient(circle at 35% 35%,#ffffff44,${p.color})`
                    : p.color,
                  boxShadow: isActive
                    ? `0 0 0 2.5px rgba(255,255,255,0.90), 0 0 16px ${p.color}cc`
                    : isHov
                    ? `0 0 0 1.5px ${p.color}99, 0 0 12px ${p.color}66`
                    : `0 0 5px ${p.color}33`,
                  outline: 'none',
                  transition: 'background 0.3s ease, box-shadow 0.18s ease',
                }}
              >
                {/* Switch ripples */}
                {isActive && switching && (
                  <>
                    <motion.span
                      initial={{ scale:0.9, opacity:0.9 }} animate={{ scale:2.8, opacity:0 }}
                      transition={{ duration:SWITCH_DUR/1000, ease:'easeOut' }}
                      style={{ position:'absolute', inset:'-1px', borderRadius:'50%', border:`1.5px solid ${p.color}`, pointerEvents:'none' }}
                    />
                    <motion.span
                      initial={{ scale:0.9, opacity:0.6 }} animate={{ scale:1.9, opacity:0 }}
                      transition={{ duration:SWITCH_DUR/1000*0.6, ease:'easeOut', delay:0.12 }}
                      style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.6)', pointerEvents:'none' }}
                    />
                  </>
                )}
                {/* Active symbol overlay */}
                {isActive && !switching && (
                  <span style={{
                    position:'absolute', inset:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'9px', opacity:0.65, userSelect:'none', color:'rgba(0,0,0,0.65)',
                  }}>{p.symbol}</span>
                )}
              </motion.button>
            )
          })}

          {/* Footer — current planet label */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity:0, height:0 }}
                animate={{ opacity:1, height:'auto' }}
                exit={{   opacity:0, height:0 }}
                transition={{ duration:0.18 }}
                style={{ paddingTop:'4px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}
              >
                <div style={{ width:'22px', height:'1px', background:'rgba(255,255,255,0.07)' }} />
                <motion.span
                  key={current.id}
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}
                  style={{
                    fontSize:    '0.54rem',
                    color:        current.color,
                    fontFamily:  '"JetBrains Mono",monospace',
                    letterSpacing:'0.06em',
                    userSelect:  'none',
                    whiteSpace:  'nowrap',
                    maxWidth:    '40px',
                    overflow:    'hidden',
                    textOverflow:'ellipsis',
                  }}
                >{current.label.toUpperCase().slice(0,6)}</motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}