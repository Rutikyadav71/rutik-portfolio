'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const MIN_DISPLAY_MS = 700    // just enough for the entrance animation to read
const HARD_CAP_MS    = 5500   // never block longer than this, no matter what

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)
  const dismissedRef = useRef(false)

  useEffect(() => {
    const start = Date.now()
    let pageLoaded  = document.readyState === 'complete'
    let threeReady  = false

    const dismiss = () => {
      if (dismissedRef.current) return
      dismissedRef.current = true
      const elapsed = Date.now() - start
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed)
      window.setTimeout(() => {
        setExiting(true)
        window.setTimeout(() => setVisible(false), 650) // matches exit transition
      }, wait)
    }

    const tryDismiss = () => {
      if (pageLoaded && threeReady) dismiss()
    }

    const onLoad = () => { pageLoaded = true; tryDismiss() }
    const onThreeReady = () => { threeReady = true; tryDismiss() }

    if (pageLoaded) {
      tryDismiss()
    } else {
      window.addEventListener('load', onLoad)
    }
    window.addEventListener('three-planet-ready', onThreeReady)

    // Safety net: never leave the preloader stuck if a signal never fires
    // (e.g. WebGL unsupported, slow network, mobile where canvas is hidden).
    const hardCap = window.setTimeout(dismiss, HARD_CAP_MS)

    return () => {
      window.removeEventListener('load', onLoad)
      window.removeEventListener('three-planet-ready', onThreeReady)
      window.clearTimeout(hardCap)
    }
  }, [])

  // Lock scroll while the preloader is up
  useEffect(() => {
    if (visible) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prevOverflow }
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.65, ease: EASE } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: '#020817',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* ambient background wash, matches site palette */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: [
                'radial-gradient(ellipse 70% 55% at 50% 30%, rgba(99,102,241,0.16) 0%, transparent 62%)',
                'radial-gradient(ellipse 60% 45% at 80% 80%, rgba(6,182,212,0.10) 0%, transparent 58%)',
              ].join(','),
            }}
          />

          {/* poster card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 26, filter: 'blur(10px)' }}
            animate={
              exiting
                ? { opacity: 0, scale: 1.06, y: -18, filter: 'blur(14px)', transition: { duration: 0.6, ease: EASE } }
                : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: EASE, delay: 0.05 } }
            }
            style={{
              position: 'relative',
              width: 'min(92vw, 560px)',
              borderRadius: '18px',
              overflow: 'hidden',
              border: '1px solid rgba(99,102,241,0.28)',
              boxShadow: '0 30px 90px -20px rgba(99,102,241,0.45)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/poster_linkedin.png"
              alt="Rutik Yadav"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              fetchPriority="high"
            />

            {/* sweeping sheen while loading */}
            {!exiting && (
              <motion.div
                animate={{ x: ['-120%', '220%'] }}
                transition={{ duration: 1.7, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, bottom: 0, width: '35%',
                  background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.14), transparent)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.div>

          {/* loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={exiting ? { opacity: 0 } : { opacity: 1, transition: { delay: 0.35, duration: 0.4 } }}
            style={{
              position: 'absolute', bottom: 'clamp(28px, 6vh, 56px)', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#818cf8,#06b6d4)',
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: '"JetBrains Mono",monospace', fontSize: '0.66rem',
                letterSpacing: '0.22em', textTransform: 'uppercase', color: '#64748b',
              }}
            >
              Loading portfolio
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
