'use client'
import dynamic from 'next/dynamic'

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr:false, loading:()=>null })

// Always render ParticleField — dark cosmic mode only, no theme system.
export default function ConditionalLayers() {
  return (
    <div aria-hidden="true" style={{ position:'fixed', inset:0, zIndex:2, pointerEvents:'none' }}>
      <ParticleField />
    </div>
  )
}