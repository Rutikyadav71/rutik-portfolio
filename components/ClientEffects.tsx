'use client'
import dynamic from 'next/dynamic'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false, loading: () => null })
const SkillOverlay    = dynamic(() => import('@/components/SkillOverlay'),     { ssr: false, loading: () => null })
const CursorGlow      = dynamic(() => import('@/components/CursorGlow'),       { ssr: false, loading: () => null })
const ScrollProgress  = dynamic(() => import('@/components/ScrollProgress'),   { ssr: false, loading: () => null })

export default function ClientEffects() {
  return (
    <>
      <ThreeBackground />
      <SkillOverlay />
      <ScrollProgress />
      <CursorGlow />
    </>
  )
}