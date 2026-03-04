'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * CursorGlow — custom cursor dot + trailing ring.
 *
 * Disabled on:
 *   - Touch / coarse-pointer devices (phones, tablets)
 *   - Narrow screens (<= 768px) as a belt-and-suspenders safety net
 *   - Any device that has reported at least one touch event
 *
 * This prevents the invisible stuck cursor on mobile.
 */
export default function CursorGlow() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos     = useRef({ x: -200, y: -200 })
  const ring    = useRef({ x: -200, y: -200 })
  const hover   = useRef(false)
  const pressed = useRef(false)
  const raf     = useRef(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Guard 1: coarse pointer (touch screens)
    if (window.matchMedia('(pointer: coarse)').matches) return

    // Guard 2: small screen (belt-and-suspenders for edge-case Android tablets)
    if (window.innerWidth <= 768) return

    // Guard 3: if the user triggers a touchstart we hide immediately
    const onTouch = () => {
      setShow(false)
      cancelAnimationFrame(raf.current)
    }
    window.addEventListener('touchstart', onTouch, { passive: true, once: true })

    setShow(true)

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 6}px,${e.clientY - 6}px)`
      }
    }
    const onDown = () => { pressed.current = true }
    const onUp   = () => { pressed.current = false }

    const setHover   = () => { hover.current = true }
    const clearHover = () => { hover.current = false }

    const attachHover = () => {
      document.querySelectorAll('a,button,input,textarea,[role=button]').forEach(el => {
        el.addEventListener('mouseenter', setHover)
        el.addEventListener('mouseleave', clearHover)
      })
    }
    attachHover()

    const obs = new MutationObserver(attachHover)
    obs.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)

    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.14
      ring.current.y += (pos.current.y - ring.current.y) * 0.14
      const s = pressed.current ? 0.55 : hover.current ? 1.85 : 1
      if (ringRef.current) {
        ringRef.current.style.transform   = `translate(${ring.current.x - 20}px,${ring.current.y - 20}px) scale(${s})`
        ringRef.current.style.borderColor = hover.current
          ? 'rgba(6,182,212,0.9)'
          : 'rgba(99,102,241,0.85)'
      }
      raf.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
      obs.disconnect()
    }
  }, [])

  if (!show) return null

  return (
    <>
      {/* Sharp dot */}
      <div ref={dotRef} style={{
        position:      'fixed',
        top:           0,
        left:          0,
        zIndex:        100000,
        width:         12,
        height:        12,
        borderRadius:  '50%',
        pointerEvents: 'none',
        willChange:    'transform',
        background:    'radial-gradient(circle,#fff 0%,#c4b5fd 45%,#6366f1 100%)',
        boxShadow:     '0 0 16px 4px rgba(99,102,241,0.85),0 0 6px 2px rgba(255,255,255,0.9)',
      }} />

      {/* Trailing ring */}
      <div ref={ringRef} style={{
        position:       'fixed',
        top:            0,
        left:           0,
        zIndex:         99999,
        width:          40,
        height:         40,
        borderRadius:   '50%',
        border:         '1.5px solid rgba(99,102,241,0.85)',
        boxShadow:      '0 0 14px rgba(99,102,241,0.5),inset 0 0 8px rgba(99,102,241,0.12)',
        pointerEvents:  'none',
        willChange:     'transform',
        transition:     'border-color 0.2s ease',
      }} />
    </>
  )
}