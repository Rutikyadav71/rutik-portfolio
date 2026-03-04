'use client'
import { useRef, MouseEvent } from 'react'

/**
 * useTilt — returns ref + handlers for a 3D tilt/parallax effect on hover.
 * Apply tiltRef to the outer container and spread handlers.
 */
export function useTilt(maxDeg = 8) {
  const tiltRef = useRef<HTMLDivElement>(null)

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5   // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) scale3d(1.02,1.02,1.02)`
    el.style.transition = 'transform 0.1s ease'
  }

  const onMouseLeave = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)'
    el.style.transition = 'transform 0.5s ease'
  }

  return { tiltRef, onMouseMove, onMouseLeave }
}
