'use client'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; baseOpacity: number; opacity: number
  color: string; phase: number
}

function buildPalette(mode: string): string[] {
  if (mode === 'starfield')    return ['rgba(226,232,240,','rgba(148,163,184,','rgba(255,255,255,','rgba(226,232,240,','rgba(200,220,255,']
  if (mode === 'minimal')      return ['rgba(99,102,241,','rgba(6,182,212,']
  if (mode === 'subtle-glow')  return ['rgba(99,102,241,','rgba(139,92,246,','rgba(99,102,241,','rgba(6,182,212,','rgba(139,92,246,']
  // default + low-motion: original PALETTE exactly
  return ['rgba(99,102,241,','rgba(6,182,212,','rgba(139,92,246,','rgba(245,158,11,','rgba(226,232,240,']
}

export default function ParticleField() {
  const { theme } = useTheme()
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const cb = () => setReady(true)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(cb, { timeout: 2000 })
    } else { setTimeout(cb, 300) }
  }, [])

  useEffect(() => {
    if (!ready) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0, raf = 0, tick = 0
    let particles: Particle[] = []
    const mouse = { x: -9999, y: -9999 }
    const palette = buildPalette(theme.particleMode)
    const isLowMotion = theme.particleMode === 'low-motion'
    const isStarfield  = theme.particleMode === 'starfield'

    const build = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      const maxCount = theme.particleMode === 'minimal' ? 40 : 100
      const count = Math.min(Math.round((W * H) / theme.particleDensity), maxCount)
      particles = Array.from({ length: count }, () => {
        const op = Math.random() * 0.38 + 0.05
        const speed = isLowMotion ? 0.08 : theme.particleSpeed
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * theme.particleSize + 0.4,
          baseOpacity: op, opacity: op,
          color: palette[Math.floor(Math.random() * palette.length)],
          phase: Math.random() * Math.PI * 2,
        }
      })
    }

    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', build)
    build()

    const draw = () => {
      tick++
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.opacity = p.baseOpacity + Math.sin(tick * 0.016 + p.phase) * 0.07
        if (!isLowMotion) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 120 && d > 0) {
            const f = ((120 - d) / 120) * 0.9
            p.vx += (dx / d) * f; p.vy += (dy / d) * f
          }
        }
        p.vx *= 0.97; p.vy *= 0.97
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0

        if (isStarfield) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = p.color + Math.min(p.opacity * 2, 1) + ')'
          ctx.fill()
        } else {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5)
          grad.addColorStop(0, p.color + p.opacity + ')')
          grad.addColorStop(1, p.color + '0)')
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = grad; ctx.fill()
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color + Math.min(p.opacity * 1.6, 1) + ')'; ctx.fill()
        }

        if (!isStarfield && !isLowMotion) {
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j]
            const cdx = p.x - q.x, cdy = p.y - q.y, cd2 = cdx*cdx+cdy*cdy
            if (cd2 < 130 * 130) {
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
              ctx.strokeStyle = `rgba(99,102,241,${0.08*(1-cd2/(130*130))})`
              ctx.lineWidth = 0.5; ctx.stroke()
            }
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', build)
    }
  }, [ready, theme.particleDensity, theme.particleSpeed, theme.particleSize, theme.particleMode, theme.particleColor])

  if (!theme.particleEnabled) return null

  return (
    <canvas ref={ref} aria-hidden="true" style={{
      position:'fixed', inset:0, zIndex:2, pointerEvents:'none',
      opacity: theme.particleOpacity,
      transition: 'opacity 0.5s ease',
    }}/>
  )
}