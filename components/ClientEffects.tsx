'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically load heavy visual components (client-side only)
const ThreeBackground = dynamic(
  () => import('@/components/ThreeBackground'),
  { ssr: false, loading: () => null }
)

const SkillOverlay = dynamic(
  () => import('@/components/SkillOverlay'),
  { ssr: false, loading: () => null }
)

const CursorGlow = dynamic(
  () => import('@/components/CursorGlow'),
  { ssr: false, loading: () => null }
)

const ScrollProgress = dynamic(
  () => import('@/components/ScrollProgress'),
  { ssr: false, loading: () => null }
)

export default function ClientEffects() {
  const [ready, setReady] = useState(false)

  // Delay loading heavy visual effects until after hydration
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  if (!ready) return null

  return (
    <>
      <ThreeBackground />
      <SkillOverlay />
      <CursorGlow />
      <ScrollProgress />
    </>
  )
}