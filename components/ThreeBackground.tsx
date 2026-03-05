'use client'
import { useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import { usePlanet, PLANETS, type PlanetDef } from '@/context/PlanetContext'

// ─────────────────────────────────────────────────────────────────────────────
//  ThreeBackground
//  ▸ ONLY the planet sphere is visible — Fibonacci network is hidden (opacity 0)
//  ▸ On mobile (≤ 768 px) the canvas is completely hidden
//  ▸ Entry animation on first load AND on every planet switch
//  ▸ Rotation / mouse parallax / scroll — UNTOUCHED
// ─────────────────────────────────────────────────────────────────────────────

interface Crater { x:number; y:number; r:number }
interface Maria  { x:number; y:number; rx:number; ry:number }

function easeOut3(t:number) { return 1-Math.pow(1-t,3) }
function easeIn2(t:number)  { return t*t }
function lerp(a:number,b:number,t:number){ return a+(b-a)*t }

const ENTRY_DUR        = 1200
const EXIT_DUR         = 380
const ENTRY_DROP       = 2.0
const ENTRY_SCALE_FROM = 0.80
const MOBILE_BP        = 768   // px — hide everything below this

type Phase = 'entry' | 'idle' | 'exit'

export default function ThreeBackground() {
  const { current: planet } = usePlanet()
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  // Defer heavy WebGL until browser is idle after first paint
  useEffect(() => {
    const cb = () => setReady(true)
    if ('requestIdleCallback' in window) (window as any).requestIdleCallback(cb, { timeout: 1500 })
    else setTimeout(cb, 400)
  }, [])

  const R = useRef<{
    sphMesh:   THREE.Mesh                 | null
    sphMat:    THREE.MeshStandardMaterial | null
    atmMat:    THREE.MeshBasicMaterial    | null
    coronaMat: THREE.MeshBasicMaterial    | null
    keyLight:  THREE.DirectionalLight     | null
    fillLight: THREE.DirectionalLight     | null
    ambLight:  THREE.AmbientLight         | null
    // Network materials — kept for disposal but opacity = 0
    eMat:      THREE.LineBasicMaterial    | null
    dotMats:   THREE.MeshBasicMaterial[]
    camera:    THREE.PerspectiveCamera    | null
    net:       THREE.Group                | null
    renderer:  THREE.WebGLRenderer        | null
    cache:     Map<string, THREE.Texture>
    loader:    THREE.TextureLoader        | null
    pid:       string
    phase:     Phase
    phaseStart:number
    scaleFrom: number
    scaleTo:   number
    camZTarget:number
    pending:   PlanetDef | null
    firstLoad: boolean
  }>({
    sphMesh:null, sphMat:null, atmMat:null, coronaMat:null,
    keyLight:null, fillLight:null, ambLight:null,
    eMat:null, dotMats:[], camera:null, net:null, renderer:null,
    cache:new Map(), loader:null,
    pid:'', phase:'entry', phaseStart:0,
    scaleFrom:ENTRY_SCALE_FROM, scaleTo:1.0,
    camZTarget:22,
    pending:null, firstLoad:true,
  })

  // ── Planet-change effect ──────────────────────────────────────────────────
  useEffect(() => {
    const r = R.current
    if (!r.sphMesh || !r.sphMat) return
    if (r.pid === planet.id) return
    if (r.phase === 'idle' || r.phase === 'entry') {
      r.pending    = planet
      r.phase      = 'exit'
      r.phaseStart = performance.now()
      r.scaleFrom  = r.sphMesh.scale.x
    }
    if (r.phase === 'exit') r.pending = planet
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planet.id])

  // ── Scene (created once) ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const container = containerRef.current
    if (!container) return

    // Hide on mobile immediately
    const updateMobileVisibility = () => {
      container.style.display = window.innerWidth <= MOBILE_BP ? 'none' : 'block'
    }
    updateMobileVisibility()
    window.addEventListener('resize', updateMobileVisibility)

    let disposed = false, rafId = 0
    const cln: Array<()=>void> = []
    const reg = (fn:()=>void) => cln.push(fn)

    import('three').then(THREE => {
      if (disposed) return
      const r = R.current
      const W = () => window.innerWidth
      const H = () => window.innerHeight

      // ── Renderer ──────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' })
      renderer.setPixelRatio(Math.min(devicePixelRatio,2))
      renderer.setSize(W(),H())
      renderer.setClearColor(0,0)
      renderer.shadowMap.enabled = true
      container.appendChild(renderer.domElement)
      renderer.domElement.style.cssText = 'position:absolute;inset:0;opacity:0;'
      r.renderer = renderer
      reg(()=>{ container.contains(renderer.domElement) && container.removeChild(renderer.domElement); renderer.dispose() })

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, W()/H(), 0.1, 300)
      camera.position.set(0,0,22)
      r.camera = camera

      // ── Sphere ────────────────────────────────────────────────────────
      const SPHERE_R = 4.2
      const sphGeo   = new THREE.SphereGeometry(SPHERE_R, 128, 96)

      const buildFallback = (): THREE.CanvasTexture => {
        const T=512, cv=document.createElement('canvas'); cv.width=cv.height=T
        const cx=cv.getContext('2d')!
        const bg=cx.createRadialGradient(T/2,T/2,0,T/2,T/2,T/2)
        bg.addColorStop(0,'#9a9fa8'); bg.addColorStop(.6,'#72787f'); bg.addColorStop(1,'#42484f')
        cx.fillStyle=bg; cx.fillRect(0,0,T,T)
        const maria:Maria[]=[{x:.28,y:.35,rx:.16,ry:.11},{x:.60,y:.24,rx:.11,ry:.09},{x:.50,y:.60,rx:.10,ry:.08},{x:.73,y:.50,rx:.09,ry:.07}]
        maria.forEach((m:Maria)=>{
          const g=cx.createRadialGradient(m.x*T,m.y*T,0,m.x*T,m.y*T,m.rx*T)
          g.addColorStop(0,'rgba(38,46,56,0.88)'); g.addColorStop(1,'rgba(38,46,56,0)')
          cx.fillStyle=g; cx.beginPath(); cx.ellipse(m.x*T,m.y*T,m.rx*T,m.ry*T,0,0,Math.PI*2); cx.fill()
        })
        const craters:Crater[]=[{x:.24,y:.38,r:.058},{x:.63,y:.33,r:.044},{x:.44,y:.68,r:.040},{x:.76,y:.53,r:.032},{x:.14,y:.58,r:.026},{x:.54,y:.19,r:.023}]
        craters.forEach((c:Crater)=>{
          const px=c.x*T,py=c.y*T,pr=c.r*T
          const fl=cx.createRadialGradient(px,py,0,px,py,pr)
          fl.addColorStop(0,'#4a5260'); fl.addColorStop(1,'#6a7280')
          cx.fillStyle=fl; cx.beginPath(); cx.arc(px,py,pr,0,Math.PI*2); cx.fill()
          cx.globalAlpha=.40
          const sh=cx.createRadialGradient(px+pr*.1,py+pr*.1,pr*.4,px,py,pr)
          sh.addColorStop(0,'rgba(10,14,22,0)'); sh.addColorStop(1,'rgba(10,14,22,0.7)')
          cx.fillStyle=sh; cx.beginPath(); cx.arc(px,py,pr,0,Math.PI*2); cx.fill()
          cx.globalAlpha=1
        })
        return new THREE.CanvasTexture(cv)
      }

      const fallback = buildFallback()
      const initP    = planet

      const sphMat = new THREE.MeshStandardMaterial({
        map:fallback, roughness:initP.roughness, metalness:initP.metalness, color:new THREE.Color(0xffffff),
      })
      r.sphMat = sphMat
      const sphMesh = new THREE.Mesh(sphGeo, sphMat)
      r.sphMesh = sphMesh
      sphMesh.scale.setScalar(ENTRY_SCALE_FROM)
      r.pid        = initP.id
      r.scaleTo    = initP.scale
      r.scaleFrom  = ENTRY_SCALE_FROM
      r.camZTarget = 22 + (initP.scale - 1.0) * 2.8
      r.phaseStart = performance.now()
      r.phase      = 'entry'

      // ── Texture loader ────────────────────────────────────────────────
      const loader = new THREE.TextureLoader()
      r.loader = loader
      const loadTex = (p: PlanetDef, cb?: (t:THREE.Texture)=>void) => {
        loader.load(p.texture, (tex:THREE.Texture) => {
          if (disposed) { tex.dispose(); return }
          tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping
          try { if ('SRGBColorSpace' in THREE) tex.colorSpace=(THREE as any).SRGBColorSpace } catch{ /* ignore */ }
          r.cache.set(p.id, tex); cb?.(tex)
        }, undefined, ()=>{})
      }
      loadTex(initP, tex => { if (r.pid===initP.id && r.sphMat) { r.sphMat.map=tex; r.sphMat.color.set(0xffffff); r.sphMat.needsUpdate=true } })
      PLANETS.forEach(p => { if (p.id!==initP.id) loadTex(p) })

      // ── Atmosphere ───────────────────────────────────────────────────
      // Opacity hard-capped at 0.015 — prevents any visible white/bright halo ring
      const ATM_MAX = 0.015
      const atmMat = new THREE.MeshBasicMaterial({ color:initP.atmColor, transparent:true, opacity:Math.min(initP.atmOpacity, ATM_MAX), side:THREE.BackSide })
      r.atmMat = atmMat
      const atmMesh = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_R+0.30,48,32), atmMat)

      // ── Sun corona ───────────────────────────────────────────────────
      const coronaMat = new THREE.MeshBasicMaterial({ color:0xff5500, transparent:true, opacity:0, side:THREE.BackSide })
      r.coronaMat = coronaMat
      const coronaMesh = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_R+0.90,48,32), coronaMat)

      // ── Fibonacci lattice — KEPT but hidden (opacity = 0) ─────────────
      // This preserves the original code structure while making it invisible.
      const NET_N=120, EDGE_MAX=2.3, NODE_R=SPHERE_R+0.04
      const golden=Math.PI*(3-Math.sqrt(5))
      interface Node3D{pos:THREE.Vector3;pulse:number;spd:number}
      const nrng=(()=>{let s=0xABCD1234;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff}})()
      const nodes:Node3D[]=[]
      for(let i=0;i<NET_N;i++){
        const yy=1-(i/(NET_N-1))*2, rad=Math.sqrt(Math.max(0,1-yy*yy)), phi=golden*i
        nodes.push({pos:new THREE.Vector3(Math.cos(phi)*rad*NODE_R,yy*NODE_R,Math.sin(phi)*rad*NODE_R),pulse:nrng()*Math.PI*2,spd:.4+nrng()*.5})
      }
      const edgePairs:[number,number][]=[]
      for(let i=0;i<NET_N;i++) for(let j=i+1;j<NET_N;j++) if(nodes[i].pos.distanceTo(nodes[j].pos)<EDGE_MAX) edgePairs.push([i,j])
      const eArr=new Float32Array(edgePairs.length*6)
      edgePairs.forEach(([a,b],k)=>{
        const o=k*6
        eArr[o]=nodes[a].pos.x; eArr[o+1]=nodes[a].pos.y; eArr[o+2]=nodes[a].pos.z
        eArr[o+3]=nodes[b].pos.x; eArr[o+4]=nodes[b].pos.y; eArr[o+5]=nodes[b].pos.z
      })
      const eGeo=new THREE.BufferGeometry(); eGeo.setAttribute('position',new THREE.BufferAttribute(eArr,3))
      // ▼ opacity:0 — network invisible; planet surface only
      const eMat=new THREE.LineBasicMaterial({color:0x8899ee,transparent:true,opacity:0})
      r.eMat=eMat
      const edgeMesh=new THREE.LineSegments(eGeo,eMat)
      const dotGeo=new THREE.SphereGeometry(0.030,5,4)
      const dotMeshes=nodes.map((nd:Node3D)=>{
        // ▼ opacity:0 — dots invisible
        const m=new THREE.Mesh(dotGeo,new THREE.MeshBasicMaterial({color:0xaaccff,transparent:true,opacity:0}))
        m.position.copy(nd.pos); return m
      })
      r.dotMats=dotMeshes.map(m=>m.material as THREE.MeshBasicMaterial)

      // ── Scene assembly ────────────────────────────────────────────────
      const root=new THREE.Group(), net=new THREE.Group()
      net.add(sphMesh, atmMesh, coronaMesh, edgeMesh, ...dotMeshes)
      root.add(net); scene.add(root)
      r.net = net

      // ── Lighting ─────────────────────────────────────────────────────
      const keyLight=new THREE.DirectionalLight(initP.keyColor,initP.keyIntensity)
      keyLight.position.set(...initP.keyPos); keyLight.castShadow=true
      scene.add(keyLight); r.keyLight=keyLight
      const fillLight=new THREE.DirectionalLight(initP.fillColor,initP.fillIntensity)
      fillLight.position.set(5,-3,-7); scene.add(fillLight); r.fillLight=fillLight
      const ambLight=new THREE.AmbientLight(initP.ambientColor,initP.ambientIntensity)
      scene.add(ambLight); r.ambLight=ambLight

      reg(()=>{
        sphGeo.dispose(); sphMat.dispose(); fallback.dispose()
        r.cache.forEach(t=>t.dispose()); r.cache.clear()
        atmMesh.geometry.dispose(); atmMat.dispose()
        coronaMesh.geometry.dispose(); coronaMat.dispose()
        dotGeo.dispose(); dotMeshes.forEach(m=>(m.material as THREE.Material).dispose())
        eGeo.dispose(); eMat.dispose()
      })

      // ── Positioning ───────────────────────────────────────────────────
      const getX   = () => W()<=900 ? 0 : Math.tan(25*Math.PI/180)*22*0.40
      const BASE_Y = 1.0
      const BASE_X = getX()
      net.position.set(BASE_X, BASE_Y-ENTRY_DROP, 0)

      const mouse={x:0,y:0}
      // ── Raycaster — uses canvas rect for pixel-perfect NDC ────────────────
      // getBoundingClientRect() is correct even if canvas has any CSS offset.
      // We dispatch a CustomEvent so SkillOverlay can react without DOM blocking.
      const raycaster = new THREE.Raycaster()
      const mouseNDC  = new THREE.Vector2()
      let lastHit = false

      window.addEventListener('mousemove',(e:MouseEvent)=>{
        // Parallax (UNTOUCHED — uses full window normalisation intentionally)
        mouse.x=(e.clientX/W()-.5)*2
        mouse.y=-(e.clientY/H()-.5)*2

        // Gate 1: hero must be in viewport
        const heroVisible = window.scrollY < window.innerHeight * 0.88
        // Gate 2: canvas must be sufficiently opaque (not in exit phase)
        const canvasOpacity = parseFloat(renderer.domElement.style.opacity || '0')
        const canvasReady   = canvasOpacity > 0.30

        if (!heroVisible || !canvasReady) {
          if (lastHit) { lastHit=false; window.dispatchEvent(new CustomEvent('planet-hover',{detail:{hit:false}})) }
          return
        }

        // Correct NDC: relative to the canvas element, not the window
        const rect = renderer.domElement.getBoundingClientRect()
        mouseNDC.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
        mouseNDC.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1

        raycaster.setFromCamera(mouseNDC, camera)
        const hits = raycaster.intersectObject(sphMesh, false)
        const hit  = hits.length > 0
        if (hit !== lastHit) {
          lastHit = hit
          window.dispatchEvent(new CustomEvent('planet-hover', { detail:{ hit } }))
        }
      })
      // Fire hit=false on scroll so overlay hides immediately on scroll
      window.addEventListener('scroll',()=>{
        if (lastHit) { lastHit=false; window.dispatchEvent(new CustomEvent('planet-hover',{detail:{hit:false}})) }
      }, { passive:true })
      window.addEventListener('resize',()=>{ camera.aspect=W()/H(); camera.updateProjectionMatrix(); renderer.setSize(W(),H()); net.position.x=getX() })

      // ── Apply planet materials helper ──────────────────────────────────
      const applyPlanetMaterials = (p:PlanetDef) => {
        if (r.sphMat) {
          r.sphMat.roughness=p.roughness; r.sphMat.metalness=p.metalness
          const tex=r.cache.get(p.id)
          if (tex) { r.sphMat.map=tex; r.sphMat.color.set(0xffffff); r.sphMat.needsUpdate=true }
        }
        if (r.atmMat)    { r.atmMat.color.set(p.atmColor); r.atmMat.opacity=Math.min(p.atmOpacity, ATM_MAX) }
        if (r.keyLight)  { r.keyLight.color.setHex(p.keyColor); r.keyLight.intensity=p.keyIntensity; r.keyLight.position.set(...p.keyPos) }
        if (r.fillLight) { r.fillLight.color.setHex(p.fillColor); r.fillLight.intensity=p.fillIntensity }
        if (r.ambLight)  { r.ambLight.color.setHex(p.ambientColor); r.ambLight.intensity=p.ambientIntensity }
      }

      // ── Render loop ───────────────────────────────────────────────────
      const clock=new THREE.Clock()
      const manualVel={x:0,y:0}, manualRot={x:0,y:0}

      const tick = () => {
        if (disposed) return
        rafId = requestAnimationFrame(tick)
        const t   = clock.getElapsedTime()
        const now = performance.now()
        const elapsed = now - r.phaseStart

        // ── Entry ────────────────────────────────────────────────────
        if (r.phase === 'entry') {
          const prog=Math.min(elapsed/ENTRY_DUR,1), e=easeOut3(prog)
          if (r.firstLoad) renderer.domElement.style.opacity=String(e)
          net.position.y=lerp(BASE_Y-ENTRY_DROP, BASE_Y, e)
          net.position.x=BASE_X
          sphMesh.scale.setScalar(lerp(r.scaleFrom, r.scaleTo, e))
          camera.position.z=lerp(r.camZTarget+2.5, r.camZTarget, e)
          if (prog>=1) { r.phase='idle'; r.firstLoad=false; sphMesh.scale.setScalar(r.scaleTo); camera.position.z=r.camZTarget }
        }

        // ── Exit ─────────────────────────────────────────────────────
        else if (r.phase === 'exit') {
          const prog=Math.min(elapsed/EXIT_DUR,1), e=easeIn2(prog)
          renderer.domElement.style.opacity=String(lerp(1,0,e))
          sphMesh.scale.setScalar(lerp(r.scaleFrom, r.scaleFrom*0.82, e))
          net.position.y=lerp(BASE_Y, BASE_Y-ENTRY_DROP*0.4, e)
          if (prog>=1 && r.pending) {
            const next=r.pending; r.pending=null; r.pid=next.id
            applyPlanetMaterials(next)
            r.scaleFrom=ENTRY_SCALE_FROM; r.scaleTo=next.scale
            r.camZTarget=22+(next.scale-1.0)*2.8
            camera.position.z=r.camZTarget+2.5
            r.phase='entry'; r.phaseStart=performance.now()
            net.position.y=BASE_Y-ENTRY_DROP
          }
        }

        // ── Idle scroll ───────────────────────────────────────────────
        if (r.phase==='idle') {
          const sp=Math.min(scrollY/Math.max(H(),1),1.2)
          renderer.domElement.style.opacity=String(Math.max(0,1-sp*2.2))
          net.position.x=BASE_X+sp*3
          net.position.y=BASE_Y-sp*0.8
        }

        // ── Mouse parallax (UNTOUCHED) ────────────────────────────────
        manualVel.y+=(mouse.x*0.012-manualVel.y)*0.010
        manualVel.x+=(mouse.y*0.008-manualVel.x)*0.010
        manualRot.y+=manualVel.y; manualRot.x+=manualVel.x
        manualVel.x*=0.88; manualVel.y*=0.88
        manualRot.x=Math.max(-Math.PI/3,Math.min(Math.PI/3,manualRot.x))

        // ── Rotation (UNTOUCHED) ──────────────────────────────────────
        net.rotation.y=t*0.018+manualRot.y
        net.rotation.x=Math.sin(t*.05)*.025+manualRot.x

        // ── Corona ───────────────────────────────────────────────────
        coronaMat.opacity=r.pid==='sun'?0.05+Math.sin(t*0.8)*0.025:0

        // ── Key light gentle orbit ────────────────────────────────────
        keyLight.position.set(
          keyLight.position.x+(Math.sin(t*.022)*.5-keyLight.position.x)*0.04,
          keyLight.position.y+(Math.cos(t*.022)*.3+6-keyLight.position.y)*0.04,
          keyLight.position.z
        )

        renderer.render(scene,camera)
      }
      tick()
    }).catch(e=>console.error('[ThreeBackground]',e))

    return ()=>{
      disposed=true; cancelAnimationFrame(rafId); cln.forEach(f=>f())
      window.removeEventListener('resize',updateMobileVisibility)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    <div ref={containerRef} aria-hidden="true"
      style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none',overflow:'hidden'}}
    />
  )
}