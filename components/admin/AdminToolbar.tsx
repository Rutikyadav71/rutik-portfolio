'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit3, Eye, LogOut, Lock, CheckCircle, Loader2, Settings, Mail, KeyRound,
  AlertCircle, X, AlertTriangle, ExternalLink, Save as SaveIcon, Shield,
  Palette, Sliders, Type, RotateCcw, ChevronDown, ChevronUp, Move,
  BookmarkCheck, BookmarkPlus, Trash2, type LucideIcon,
} from 'lucide-react'
import { useAdmin }     from '@/context/AdminContext'
import { usePortfolio } from '@/context/PortfolioContext'
import { useTheme, ThemeSettings, DEFAULT_THEME } from '@/context/ThemeContext'

// ─── Mini widgets ──────────────────────────────────────────────────────────────
function ColorRow({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',marginBottom:'10px' }}>
      {label && <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em',flex:1 }}>{label}</span>}
      <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
        <input type="color" value={value.startsWith('#') ? value : '#6366f1'} onChange={e=>onChange(e.target.value)}
          style={{ width:'28px',height:'28px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.12)',background:'transparent',cursor:'pointer',padding:0 }}/>
        <input value={value} onChange={e=>onChange(e.target.value)}
          style={{ width:'108px',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'6px',padding:'4px 7px',fontSize:'0.68rem',color:'#e2e8f0',outline:'none',fontFamily:'"JetBrains Mono",monospace' }}/>
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, unit='', accent='#6366f1', onChange }: {
  label:string; value:number; min:number; max:number; step:number; unit?:string; accent?:string; onChange:(v:number)=>void
}) {
  return (
    <div style={{ marginBottom:'12px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'5px' }}>
        <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em' }}>{label}</span>
        <span style={{ fontSize:'0.68rem',color:accent,fontFamily:'"JetBrains Mono",monospace' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(parseFloat(e.target.value))} style={{ width:'100%',accentColor:accent }}/>
    </div>
  )
}

function ToggleRow({ label, value, onChange }: { label:string; value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px' }}>
      <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em' }}>{label}</span>
      <button onClick={()=>onChange(!value)}
        style={{ width:'40px',height:'20px',borderRadius:'10px',background:value?'rgba(99,102,241,0.50)':'rgba(255,255,255,0.08)',border:`1px solid ${value?'rgba(99,102,241,0.70)':'rgba(255,255,255,0.12)'}`,cursor:'pointer',position:'relative',padding:0,transition:'all 0.2s' }}>
        <span style={{ position:'absolute',top:'2px',left:value?'21px':'2px',width:'14px',height:'14px',borderRadius:'50%',background:value?'#818cf8':'#64748b',transition:'left 0.2s',display:'block' }}/>
      </button>
    </div>
  )
}

// ─── Section accordion with per-section reset ──────────────────────────────────
function Section({ title, icon:Icon, children, color='#818cf8', onReset }: {
  title:string; icon:LucideIcon; children:React.ReactNode; color?:string; onReset?:()=>void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:'1px solid rgba(255,255,255,0.05)',marginBottom:'2px' }}>
      <button onClick={()=>setOpen(p=>!p)}
        style={{ width:'100%',display:'flex',alignItems:'center',gap:'8px',padding:'10px 0',background:'none',border:'none',cursor:'pointer',textAlign:'left' }}>
        <Icon size={13} color={color}/>
        <span style={{ flex:1,fontSize:'0.72rem',fontFamily:'Syne,sans-serif',fontWeight:600,color:'#e2e8f0' }}>{title}</span>
        {open ? <ChevronUp size={12} color="#475569"/> : <ChevronDown size={12} color="#475569"/>}
      </button>
      {open && (
        <div style={{ paddingBottom:'14px' }}>
          {onReset && (
            <button onClick={onReset}
              style={{ display:'flex',alignItems:'center',gap:'4px',padding:'3px 9px',borderRadius:'6px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.22)',color:'#f87171',cursor:'pointer',fontSize:'0.60rem',fontFamily:'"JetBrains Mono",monospace',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'10px' }}>
              <RotateCcw size={9}/> Reset section
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Saved Theme Slots ─────────────────────────────────────────────────────────
function ThemeSlotsPanel() {
  const { theme, savedSlots, saveSlot, loadSlot, clearSlot } = useTheme()
  const [editIdx, setEditIdx] = useState<number|null>(null)
  const [nameInput, setNameInput] = useState('')
  const SLOT_COLORS = ['#818cf8','#34d399','#f59e0b']

  return (
    <div style={{ padding:'2px 0 8px' }}>
      <p style={{ margin:'0 0 10px',fontSize:'0.63rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',lineHeight:1.5 }}>
        Save your current design to a slot and load it anytime. Stored in browser.
      </p>
      <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
        {savedSlots.map((slot, idx) => (
          <div key={idx} style={{ borderRadius:'10px',border:`1px solid rgba(${idx===0?'129,140,248':idx===1?'52,211,153':'245,158,11'},0.20)`,background:'rgba(255,255,255,0.02)',overflow:'hidden' }}>
            {editIdx === idx ? (
              <div style={{ display:'flex',gap:'6px',padding:'8px 10px' }}>
                <input autoFocus value={nameInput} onChange={e=>setNameInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){saveSlot(idx,nameInput||slot.name);setEditIdx(null)} if(e.key==='Escape')setEditIdx(null) }}
                  placeholder="Slot name…"
                  style={{ flex:1,background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.40)',borderRadius:'6px',padding:'5px 8px',fontSize:'0.72rem',color:'#e2e8f0',outline:'none',fontFamily:'"JetBrains Mono",monospace' }}/>
                <button onClick={()=>{saveSlot(idx,nameInput||slot.name);setEditIdx(null)}}
                  style={{ padding:'5px 10px',borderRadius:'6px',background:'rgba(52,211,153,0.15)',border:'1px solid rgba(52,211,153,0.35)',color:'#34d399',cursor:'pointer',fontSize:'0.68rem',fontFamily:'Syne,sans-serif',fontWeight:600 }}>
                  Save
                </button>
                <button onClick={()=>setEditIdx(null)}
                  style={{ padding:'5px 8px',borderRadius:'6px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#64748b',cursor:'pointer' }}>
                  <X size={12}/>
                </button>
              </div>
            ) : (
              <div style={{ display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px' }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:SLOT_COLORS[idx],flexShrink:0 }}/>
                <span style={{ flex:1,fontSize:'0.72rem',fontFamily:'Syne,sans-serif',color:'#cbd5e1',fontWeight:600 }}>{slot.name}</span>
                {/* Load */}
                <button title="Load this theme" onClick={()=>loadSlot(idx)}
                  style={{ display:'flex',alignItems:'center',gap:'3px',padding:'4px 8px',borderRadius:'6px',background:`rgba(${idx===0?'129,140,248':idx===1?'52,211,153':'245,158,11'},0.12)`,border:`1px solid rgba(${idx===0?'129,140,248':idx===1?'52,211,153':'245,158,11'},0.28)`,color:SLOT_COLORS[idx],cursor:'pointer',fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace' }}>
                  <BookmarkCheck size={10}/> Load
                </button>
                {/* Save current */}
                <button title="Save current design here" onClick={()=>{setNameInput(slot.name);setEditIdx(idx)}}
                  style={{ display:'flex',alignItems:'center',gap:'3px',padding:'4px 8px',borderRadius:'6px',background:'rgba(99,102,241,0.10)',border:'1px solid rgba(99,102,241,0.22)',color:'#818cf8',cursor:'pointer',fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace' }}>
                  <BookmarkPlus size={10}/> Save
                </button>
                {/* Clear */}
                <button title="Clear slot" onClick={()=>clearSlot(idx)}
                  style={{ padding:'4px 6px',borderRadius:'6px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.18)',color:'#f87171',cursor:'pointer' }}>
                  <Trash2 size={10}/>
                </button>
              </div>
            )}
            {/* Color preview strip */}
            {editIdx !== idx && (
              <div style={{ display:'flex',height:'3px' }}>
                {(['bgColor','navBg','cardBg'] as (keyof ThemeSettings)[]).map(k => (
                  <div key={String(k)} style={{ flex:1,background:String(slot.theme[k]||'#334155') }}/>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Design Settings Panel (draggable) ────────────────────────────────────────
function DesignPanel({ onClose }: { onClose:()=>void }) {
  const { theme, updateTheme, resetTheme, saveThemeToCloud, themeSaving } = useTheme()
  const [saved, setSaved] = useState(false)
  const panelRef  = useRef<HTMLDivElement>(null)
  const dragging  = useRef(false)
  const origin    = useRef({ mx:0, my:0, px:0, py:0 })
  const posRef    = useRef({ x: 0, y: 80 })
  const [, forceRender] = useState(0)

  // Set initial position on mount (client-only, avoids SSR window access)
  useEffect(() => {
    const x = Math.max(0, window.innerWidth - 360)
    posRef.current = { x, y: 80 }
    if (panelRef.current) {
      panelRef.current.style.left = `${x}px`
      panelRef.current.style.top  = `80px`
    }
  }, [])

  const u = (patch: Partial<ThemeSettings>) => updateTheme(patch)

  const handleHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, px: posRef.current.x, py: posRef.current.y }

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !panelRef.current) return
      const nx = origin.current.px + (ev.clientX - origin.current.mx)
      const ny = origin.current.py + (ev.clientY - origin.current.my)
      // Clamp to viewport
      const el = panelRef.current
      const maxX = window.innerWidth  - el.offsetWidth
      const maxY = window.innerHeight - el.offsetHeight
      posRef.current = { x: Math.max(0, Math.min(nx, maxX)), y: Math.max(0, Math.min(ny, maxY)) }
      el.style.left = `${posRef.current.x}px`
      el.style.top  = `${posRef.current.y}px`
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const handleSave = async () => {
    await saveThemeToCloud(); setSaved(true); setTimeout(()=>setSaved(false), 3000)
  }
  const handleResetAll = () => {
    if (confirm('Reset ALL design settings to defaults?')) resetTheme()
  }
  const resetSection = (keys: (keyof ThemeSettings)[]) => {
    const patch: Partial<ThemeSettings> = {}
    keys.forEach(k => { (patch as Record<string,unknown>)[k] = DEFAULT_THEME[k] })
    updateTheme(patch)
  }

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity:0, scale:0.95 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.95 }}
      transition={{ duration:0.18, ease:[0.22,1,0.36,1] }}
      style={{
        position:'fixed', zIndex:9999,
        left:`${posRef.current.x}px`, top:`${posRef.current.y}px`,
        width:'334px', maxHeight:'82vh',
        background:'rgba(6,12,32,0.98)', border:'1px solid rgba(99,102,241,0.28)',
        borderRadius:'18px', backdropFilter:'blur(28px)',
        boxShadow:'0 0 60px rgba(99,102,241,0.12),0 32px 80px rgba(0,0,0,0.7)',
        display:'flex', flexDirection:'column', overflow:'hidden', userSelect:'none',
      }}>

      {/* ── Drag handle header ── */}
      <div
        onMouseDown={handleHeaderMouseDown}
        style={{ display:'flex',alignItems:'center',gap:'8px',padding:'13px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,cursor:'grab',background:'rgba(99,102,241,0.04)' }}>
        <Move size={13} color="#475569"/>
        <Palette size={14} color="#818cf8"/>
        <span style={{ flex:1,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.88rem',color:'#f1f5f9' }}>Design Settings</span>
        <span style={{ fontSize:'0.58rem',fontFamily:'"JetBrains Mono",monospace',color:'#334155' }}>drag to move</span>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'6px',color:'#64748b',cursor:'pointer',width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <X size={12}/>
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ overflowY:'auto',padding:'12px 16px',flex:1 }}>

        {/* Saved Themes */}
        <Section title="Saved Theme Slots" icon={BookmarkCheck} color="#f59e0b">
          <ThemeSlotsPanel/>
        </Section>

        {/* Background */}
        <Section title="Background" icon={Sliders} color="#06b6d4"
          onReset={()=>resetSection(['bgColor','bgGradientEnabled','bgGradient1','bgGradient2','bgGradientDir','bgGlowEnabled','bgGlowColor'])}>
          <ColorRow label="Base Color" value={theme.bgColor} onChange={v=>u({bgColor:v})}/>
          <ToggleRow label="Gradient" value={theme.bgGradientEnabled} onChange={v=>u({bgGradientEnabled:v})}/>
          {theme.bgGradientEnabled && <>
            <ColorRow label="Color 1" value={theme.bgGradient1} onChange={v=>u({bgGradient1:v})}/>
            <ColorRow label="Color 2" value={theme.bgGradient2} onChange={v=>u({bgGradient2:v})}/>
            <div style={{ marginBottom:'10px' }}>
              <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Direction</span>
              <div style={{ display:'flex',gap:'5px',flexWrap:'wrap' }}>
                {['to bottom','to right','135deg','to bottom right'].map(d=>(
                  <button key={d} onClick={()=>u({bgGradientDir:d})}
                    style={{ padding:'3px 8px',borderRadius:'5px',fontSize:'0.60rem',fontFamily:'"JetBrains Mono",monospace',border:`1px solid ${theme.bgGradientDir===d?'rgba(99,102,241,0.70)':'rgba(255,255,255,0.08)'}`,background:theme.bgGradientDir===d?'rgba(99,102,241,0.20)':'rgba(255,255,255,0.02)',color:theme.bgGradientDir===d?'#818cf8':'#64748b',cursor:'pointer' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </>}
          <ToggleRow label="Glow Effect" value={theme.bgGlowEnabled} onChange={v=>u({bgGlowEnabled:v})}/>
          {theme.bgGlowEnabled && <ColorRow label="Glow Color" value={theme.bgGlowColor} onChange={v=>u({bgGlowColor:v})}/>}
        </Section>

        {/* Particles */}
        <Section title="Particles" icon={Sliders} color="#34d399"
          onReset={()=>resetSection(['particleEnabled','particleColor','particleDensity','particleSpeed','particleSize','particleOpacity','particleMode'])}>
          <ToggleRow label="Enable" value={theme.particleEnabled} onChange={v=>u({particleEnabled:v})}/>
          {theme.particleEnabled && <>
            <div style={{ marginBottom:'12px' }}>
              <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Mode</span>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px' }}>
                {(['default','starfield','minimal','subtle-glow','low-motion'] as const).map(m=>(
                  <button key={m} onClick={()=>u({particleMode:m})}
                    style={{ padding:'5px 8px',borderRadius:'6px',fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace',border:`1px solid ${theme.particleMode===m?'rgba(52,211,153,0.60)':'rgba(255,255,255,0.08)'}`,background:theme.particleMode===m?'rgba(52,211,153,0.14)':'rgba(255,255,255,0.02)',color:theme.particleMode===m?'#34d399':'#64748b',cursor:'pointer' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <ColorRow label="Color" value={theme.particleColor} onChange={v=>u({particleColor:v})}/>
            <SliderRow label="Density" value={theme.particleDensity} min={5000} max={30000} step={1000} accent="#34d399" onChange={v=>u({particleDensity:v})}/>
            <SliderRow label="Speed"   value={theme.particleSpeed}   min={0.05} max={1.0}   step={0.05} accent="#34d399" onChange={v=>u({particleSpeed:v})}/>
            <SliderRow label="Size"    value={theme.particleSize}    min={0.5}  max={5}     step={0.1}  accent="#34d399" onChange={v=>u({particleSize:v})}/>
            <SliderRow label="Opacity" value={theme.particleOpacity} min={0.1}  max={1}     step={0.02} accent="#34d399" onChange={v=>u({particleOpacity:v})}/>
          </>}
        </Section>

        {/* Navbar */}
        <Section title="Navbar" icon={Sliders} color="#f59e0b"
          onReset={()=>resetSection(['navBg','navBlur','navBorderColor','navTextColor','navHoverColor','navActiveColor'])}>
          <ColorRow label="Background" value={theme.navBg} onChange={v=>u({navBg:v})}/>
          <SliderRow label="Blur" value={theme.navBlur} min={0} max={40} step={1} unit="px" accent="#f59e0b" onChange={v=>u({navBlur:v})}/>
          <ColorRow label="Border" value={theme.navBorderColor} onChange={v=>u({navBorderColor:v})}/>
          <ColorRow label="Text"   value={theme.navTextColor}   onChange={v=>u({navTextColor:v})}/>
          <ColorRow label="Hover"  value={theme.navHoverColor}  onChange={v=>u({navHoverColor:v})}/>
          <ColorRow label="Active" value={theme.navActiveColor} onChange={v=>u({navActiveColor:v})}/>
        </Section>

        {/* Typography */}
        <Section title="Typography" icon={Type} color="#a78bfa"
          onReset={()=>resetSection(['globalFont','headingFont','bodyFont','baseFontSize','headingScale','paragraphSpacing','globalTextColor'])}>
          <div style={{ marginBottom:'10px' }}>
            <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Body Font</span>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'5px' }}>
              {['"DM Sans",sans-serif','"Inter",sans-serif','"Space Grotesk",sans-serif','"Outfit",sans-serif','"JetBrains Mono",monospace','Georgia,serif','system-ui,sans-serif'].map(f=>(
                <button key={f} onClick={()=>u({bodyFont:f,globalFont:f})}
                  style={{ padding:'4px 10px',borderRadius:'6px',fontSize:'0.65rem',fontFamily:f,border:`1px solid ${theme.bodyFont===f?'rgba(167,139,250,0.60)':'rgba(255,255,255,0.08)'}`,background:theme.bodyFont===f?'rgba(167,139,250,0.14)':'rgba(255,255,255,0.02)',color:theme.bodyFont===f?'#a78bfa':'#64748b',cursor:'pointer' }}>
                  {f.split(',')[0].replace(/"/g,'')}
                </button>
              ))}
            </div>
          </div>
          <SliderRow label="Base Font Size" value={parseFloat(theme.baseFontSize)} min={12} max={20} step={0.5} unit="px" accent="#a78bfa" onChange={v=>u({baseFontSize:String(v)})}/>
          <SliderRow label="Line Spacing"   value={parseFloat(theme.paragraphSpacing)} min={1.2} max={2.4} step={0.05} accent="#a78bfa" onChange={v=>u({paragraphSpacing:String(v)})}/>
          <ColorRow label="Global Text Color" value={theme.globalTextColor??'#f1f5f9'} onChange={v=>u({globalTextColor:v})}/>
        </Section>

        {/* Profile Frame */}
        <Section title="Profile Frame" icon={Palette} color="#ec4899"
          onReset={()=>resetSection(['frameBorderColor','frameGlowGradient','frameThickness','frameBgColor'])}>
          <ColorRow label="Border Color" value={theme.frameBorderColor} onChange={v=>u({frameBorderColor:v})}/>
          <SliderRow label="Thickness" value={theme.frameThickness} min={0} max={8} step={0.5} unit="px" accent="#ec4899" onChange={v=>u({frameThickness:v})}/>
          <ColorRow label="Background" value={theme.frameBgColor} onChange={v=>u({frameBgColor:v})}/>
          <div style={{ marginBottom:'10px' }}>
            <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Glow</span>
            {[
              { label:'Gradient', val:'linear-gradient(135deg,rgba(99,102,241,0.70),rgba(6,182,212,0.60),rgba(139,92,246,0.65))' },
              { label:'Indigo',   val:'linear-gradient(135deg,rgba(99,102,241,0.80),rgba(99,102,241,0.40))' },
              { label:'Cyan',     val:'linear-gradient(135deg,rgba(6,182,212,0.80),rgba(6,182,212,0.40))' },
              { label:'Gold',     val:'linear-gradient(135deg,rgba(245,158,11,0.80),rgba(251,191,36,0.40))' },
              { label:'None',     val:'transparent' },
            ].map(s=>(
              <button key={s.label} onClick={()=>u({frameGlowGradient:s.val})}
                style={{ display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',borderRadius:'7px',border:`1px solid ${theme.frameGlowGradient===s.val?'rgba(236,72,153,0.50)':'rgba(255,255,255,0.06)'}`,background:theme.frameGlowGradient===s.val?'rgba(236,72,153,0.10)':'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'left',marginBottom:'4px',width:'100%' }}>
                <div style={{ width:14,height:14,borderRadius:'3px',background:s.val==='transparent'?'rgba(255,255,255,0.08)':s.val,flexShrink:0 }}/>
                <span style={{ fontSize:'0.70rem',color:theme.frameGlowGradient===s.val?'#f1f5f9':'#64748b' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Card Colors */}
        <Section title="Card Colors / Blur" icon={Sliders} color="#fb923c"
          onReset={()=>resetSection(['cardBg','cardBorder','cardRadius','cardBlur'])}>
          <ColorRow label="Background" value={theme.cardBg}     onChange={v=>u({cardBg:v})}/>
          <ColorRow label="Border"     value={theme.cardBorder} onChange={v=>u({cardBorder:v})}/>
          <SliderRow label="Radius" value={theme.cardRadius??18} min={0} max={32} step={1} unit="px" accent="#fb923c" onChange={v=>u({cardRadius:v})}/>
          <SliderRow label="Blur"   value={theme.cardBlur??20}   min={0} max={60} step={1} unit="px" accent="#fb923c" onChange={v=>u({cardBlur:v})}/>
          <div style={{ padding:'8px 10px',borderRadius:`${theme.cardRadius??18}px`,background:theme.cardBg,border:`1px solid ${theme.cardBorder}`,backdropFilter:`blur(${theme.cardBlur??20}px)`,marginTop:'4px' }}>
            <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b' }}>Preview</span>
          </div>
        </Section>

        {/* Available Badge */}
        <Section title="Available Badge Style" icon={Palette} color="#34d399"
          onReset={()=>resetSection(['badgeBg','badgeBorder','badgeTextColor','badgeDotColor','badgeFontSize'])}>
          <p style={{ margin:'0 0 10px',fontSize:'0.63rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569' }}>
            Text is editable in Edit Mode. Style here.
          </p>
          <ColorRow label="Text Color"  value={theme.badgeTextColor} onChange={v=>u({badgeTextColor:v})}/>
          <ColorRow label="Dot Color"   value={theme.badgeDotColor}  onChange={v=>u({badgeDotColor:v})}/>
          <ColorRow label="Background"  value={theme.badgeBg}        onChange={v=>u({badgeBg:v})}/>
          <ColorRow label="Border"      value={theme.badgeBorder}    onChange={v=>u({badgeBorder:v})}/>
          <SliderRow label="Font Size" value={theme.badgeFontSize??0.78} min={0.60} max={1.10} step={0.01} unit="rem" accent="#34d399" onChange={v=>u({badgeFontSize:v})}/>
          <div style={{ display:'inline-flex',alignItems:'center',gap:'8px',padding:'6px 14px',borderRadius:'9999px',background:theme.badgeBg,border:`1px solid ${theme.badgeBorder}`,marginTop:'4px' }}>
            <div style={{ width:6,height:6,borderRadius:'50%',background:theme.badgeDotColor,boxShadow:`0 0 6px ${theme.badgeDotColor}` }}/>
            <span style={{ fontSize:`${theme.badgeFontSize??0.78}rem`,color:theme.badgeTextColor,fontFamily:'"JetBrains Mono",monospace' }}>Badge preview</span>
          </div>
        </Section>

      </div>

      {/* ── Footer ── */}
      <div style={{ display:'flex',gap:'8px',padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0 }}>
        <button onClick={handleResetAll}
          style={{ display:'flex',alignItems:'center',gap:'5px',padding:'8px 12px',borderRadius:'8px',background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.28)',color:'#f87171',cursor:'pointer',fontSize:'0.72rem',fontFamily:'Syne,sans-serif',fontWeight:600 }}>
          <RotateCcw size={12}/> Reset All
        </button>
        <button onClick={handleSave} disabled={themeSaving}
          style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'8px 14px',borderRadius:'8px',background:'rgba(52,211,153,0.14)',border:'1px solid rgba(52,211,153,0.35)',color:'#34d399',cursor:themeSaving?'wait':'pointer',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600 }}>
          {themeSaving?<Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>:saved?<CheckCircle size={13}/>:<SaveIcon size={13}/>}
          {themeSaving?'Saving…':saved?'Saved!':'Save Design'}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Config warning ────────────────────────────────────────────────────────────
function ConfigWarning({ onClose }: { onClose:()=>void }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL||''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||''
  const urlOk = url.startsWith('https://') && url.includes('.supabase.co')
  const keyOk = key.length > 20
  return (
    <motion.div initial={{opacity:0,y:16,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:16,scale:0.95}}
      style={{ position:'fixed',bottom:'80px',right:'24px',zIndex:9998,width:'360px',maxWidth:'calc(100vw - 48px)',background:'rgba(8,15,40,0.96)',border:'1px solid rgba(251,191,36,0.35)',borderRadius:'18px',padding:'20px',backdropFilter:'blur(24px)',boxShadow:'0 0 40px rgba(251,191,36,0.12),0 20px 60px rgba(0,0,0,0.6)' }}>
      <button onClick={onClose} style={{ position:'absolute',top:'14px',right:'14px',padding:'4px',background:'none',border:'none',color:'#475569',cursor:'pointer' }}><X size={14}/></button>
      <div style={{ display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px' }}>
        <div style={{ padding:'8px',borderRadius:'10px',background:'rgba(251,191,36,0.10)',color:'#fbbf24' }}><AlertTriangle size={17}/></div>
        <div>
          <p style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:600,color:'#fff',fontSize:'0.88rem' }}>Supabase not configured</p>
          <p style={{ margin:'2px 0 0',color:'#64748b',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace' }}>Admin login requires env vars</p>
        </div>
      </div>
      {[{ok:urlOk,label:'NEXT_PUBLIC_SUPABASE_URL',value:url||'(missing)'},{ok:keyOk,label:'NEXT_PUBLIC_SUPABASE_ANON_KEY',value:key?key.slice(0,18)+'…':'(missing)'}].map(({ok,label,value})=>(
        <div key={label} style={{ display:'flex',alignItems:'flex-start',gap:'8px',padding:'8px 10px',borderRadius:'10px',background:ok?'rgba(52,211,153,0.06)':'rgba(239,68,68,0.08)',border:`1px solid ${ok?'rgba(52,211,153,0.18)':'rgba(239,68,68,0.18)'}`,marginBottom:'6px' }}>
          <span style={{ color:ok?'#34d399':'#f87171',marginTop:'1px',flexShrink:0 }}>{ok?<CheckCircle size={11}/>:<AlertCircle size={11}/>}</span>
          <div><p style={{ margin:0,fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b' }}>{label}</p><p style={{ margin:'2px 0 0',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:ok?'#34d399':'#f87171' }}>{value}</p></div>
        </div>
      ))}
      <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
        style={{ display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'0.72rem',color:'#818cf8',textDecoration:'none',marginTop:'10px' }}>
        <ExternalLink size={11}/> Open Supabase Dashboard
      </a>
    </motion.div>
  )
}

// ─── Main AdminToolbar ─────────────────────────────────────────────────────────
export default function AdminToolbar() {
  const { isAdmin, isEditMode, loading, supabaseReady, signIn, signOut, toggleEditMode } = useAdmin()
  const { saveToCloud, saving } = usePortfolio()

  const [showLogin,    setShowLogin]    = useState(false)
  const [showWarning,  setShowWarning]  = useState(false)
  const [showDesign,   setShowDesign]   = useState(false)
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError,   setLoginError]   = useState('')
  const [saved,        setSaved]        = useState(false)

  // Add/remove admin-mode class on body for cursor management
  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-mode')
    } else {
      document.body.classList.remove('admin-mode')
    }
    return () => document.body.classList.remove('admin-mode')
  }, [isAdmin])

  // Close design panel when exiting edit mode
  useEffect(() => {
    if (!isEditMode) setShowDesign(false)
  }, [isEditMode])

  if (loading) return null

  const openLogin = () => {
    if (!supabaseReady) setShowWarning(true)
    else { setShowLogin(true); setLoginError('') }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true); setLoginError('')
    const { error } = await signIn(email, password)
    setLoginLoading(false)
    if (error) setLoginError(error)
    else { setShowLogin(false); setEmail(''); setPassword('') }
  }

  const handleSave = async () => {
    await saveToCloud(); setSaved(true); setTimeout(()=>setSaved(false), 3000)
  }

  return (
    <>
      {/* ── Lock / Shield button ── */}
      <motion.button
        initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}}
        transition={{delay:2.5,type:'spring',stiffness:280,damping:22}}
        onClick={isAdmin ? undefined : openLogin}
        title={isAdmin?'Admin active':'Admin Login'}
        style={{ position:'fixed',bottom:'24px',right:'24px',zIndex:9997,width:'46px',height:'46px',borderRadius:'13px',display:'flex',alignItems:'center',justifyContent:'center',background:isAdmin?'linear-gradient(135deg,rgba(52,211,153,0.18),rgba(6,182,212,0.18))':'rgba(8,15,40,0.88)',border:isAdmin?'1px solid rgba(52,211,153,0.45)':'1px solid rgba(99,102,241,0.28)',color:isAdmin?'#34d399':'#64748b',cursor:isAdmin?'default':'pointer',backdropFilter:'blur(16px)',boxShadow:isAdmin?'0 0 20px rgba(52,211,153,0.22),0 4px 20px rgba(0,0,0,0.5)':'0 4px 20px rgba(0,0,0,0.5)',transition:'all 0.3s ease' }}>
        {isAdmin ? <Shield size={18}/> : <Settings size={18}/>}
      </motion.button>

      {/* ── Admin toolbar (floats above gear button) ── */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
            transition={{type:'spring',stiffness:280,damping:26}}
            style={{ position:'fixed',bottom:'82px',right:'24px',zIndex:9996,display:'flex',flexDirection:'column',gap:'8px',alignItems:'flex-end' }}>

            {/* Status pill */}
            <div style={{ display:'flex',alignItems:'center',gap:'7px',padding:'5px 12px',borderRadius:'9999px',background:'rgba(8,15,40,0.90)',border:`1px solid ${isEditMode?'rgba(251,191,36,0.35)':'rgba(52,211,153,0.35)'}`,backdropFilter:'blur(16px)' }}>
              <motion.div animate={{opacity:isEditMode?[1,0.3,1]:1}} transition={{duration:1.4,repeat:isEditMode?Infinity:0}}
                style={{ width:7,height:7,borderRadius:'50%',background:isEditMode?'#fbbf24':'#34d399',boxShadow:`0 0 6px ${isEditMode?'#fbbf24':'#34d399'}` }}/>
              <span style={{ fontSize:'0.70rem',fontFamily:'"JetBrains Mono",monospace',color:isEditMode?'#fbbf24':'#34d399' }}>
                {isEditMode ? 'Edit Mode' : 'View Mode'}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex',gap:'8px',alignItems:'center' }}>

              {isEditMode ? (
                <>
                  {/* Design button — only in edit mode */}
                  <motion.button onClick={()=>setShowDesign(p=>!p)}
                    whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                    style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:showDesign?'rgba(99,102,241,0.20)':'rgba(99,102,241,0.10)',border:`1px solid ${showDesign?'rgba(99,102,241,0.55)':'rgba(99,102,241,0.28)'}`,color:'#818cf8',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                    <Palette size={13}/> Design
                  </motion.button>
                  <motion.button onClick={handleSave} disabled={saving}
                    whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                    style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:'rgba(52,211,153,0.14)',border:'1px solid rgba(52,211,153,0.35)',color:'#34d399',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                    {saving?<Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>:saved?<CheckCircle size={13}/>:<SaveIcon size={13}/>}
                    {saving?'Saving…':saved?'Saved!':'Save'}
                  </motion.button>
                  <motion.button onClick={toggleEditMode}
                    whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                    style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:'rgba(8,15,40,0.88)',border:'1px solid rgba(71,85,105,0.45)',color:'#94a3b8',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:500,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                    <Eye size={13}/> Preview
                  </motion.button>
                </>
              ) : (
                <motion.button onClick={toggleEditMode}
                  whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                  style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:'rgba(99,102,241,0.14)',border:'1px solid rgba(99,102,241,0.35)',color:'#818cf8',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                  <Edit3 size={13}/> Edit Portfolio
                </motion.button>
              )}

              <motion.button onClick={signOut}
                whileHover={{scale:1.08}} whileTap={{scale:0.92}} title="Sign out"
                style={{ display:'flex',alignItems:'center',justifyContent:'center',width:'36px',height:'36px',borderRadius:'10px',background:'rgba(8,15,40,0.88)',border:'1px solid rgba(71,85,105,0.35)',color:'#475569',cursor:'pointer',backdropFilter:'blur(16px)',transition:'all 0.2s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#f87171';(e.currentTarget as HTMLElement).style.borderColor='rgba(239,68,68,0.35)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='#475569';(e.currentTarget as HTMLElement).style.borderColor='rgba(71,85,105,0.35)'}}>
                <LogOut size={14}/>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Design panel — only in edit mode ── */}
      <AnimatePresence>
        {isAdmin && isEditMode && showDesign && <DesignPanel onClose={()=>setShowDesign(false)}/>}
      </AnimatePresence>

      {/* ── Config warning ── */}
      <AnimatePresence>
        {showWarning && <ConfigWarning onClose={()=>setShowWarning(false)}/>}
      </AnimatePresence>

      {/* ── Login modal ── */}
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setShowLogin(false)}
            style={{ position:'fixed',inset:0,zIndex:99998,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(12px)' }}>
            <motion.div initial={{scale:0.88,opacity:0,y:32}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.88,opacity:0,y:32}}
              transition={{type:'spring',stiffness:320,damping:26}}
              onClick={e=>e.stopPropagation()}
              style={{ position:'relative',width:'100%',maxWidth:'400px' }}>
              <div style={{ position:'relative',background:'rgba(5,10,28,0.97)',border:'1px solid rgba(99,102,241,0.28)',borderRadius:'22px',padding:'36px',boxShadow:'0 0 60px rgba(99,102,241,0.18),0 30px 80px rgba(0,0,0,0.7)' }}>
                <button onClick={()=>setShowLogin(false)}
                  style={{ position:'absolute',top:'16px',right:'16px',width:'30px',height:'30px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#475569',cursor:'pointer' }}>
                  <X size={14}/>
                </button>
                <div style={{ display:'flex',alignItems:'center',gap:'14px',marginBottom:'28px' }}>
                  <motion.div animate={{rotate:[0,-6,6,0]}} transition={{duration:3,repeat:Infinity,repeatDelay:2}}
                    style={{ width:'48px',height:'48px',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,rgba(99,102,241,0.20),rgba(139,92,246,0.15))',border:'1px solid rgba(99,102,241,0.30)',color:'#818cf8' }}>
                    <Lock size={22}/>
                  </motion.div>
                  <div>
                    <h2 style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'#f1f5f9' }}>Admin Login</h2>
                    <p style={{ margin:'3px 0 0',fontSize:'0.78rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569' }}>Sign in to access edit mode</p>
                  </div>
                </div>
                <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
                  <div style={{ position:'relative' }}>
                    <Mail size={14} style={{ position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#475569',pointerEvents:'none',zIndex:2 }}/>
                    <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setLoginError('')}} placeholder="your@email.com" required autoFocus
                      style={{ width:'100%',boxSizing:'border-box',padding:'13px 14px 13px 38px',borderRadius:'12px',outline:'none',background:'rgba(15,23,42,0.85)',border:'1px solid rgba(71,85,105,0.50)',color:'#f1f5f9',fontSize:'0.90rem' }}/>
                  </div>
                  <div style={{ position:'relative' }}>
                    <KeyRound size={14} style={{ position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#475569',pointerEvents:'none',zIndex:2 }}/>
                    <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setLoginError('')}} placeholder="Password" required
                      style={{ width:'100%',boxSizing:'border-box',padding:'13px 14px 13px 38px',borderRadius:'12px',outline:'none',background:'rgba(15,23,42,0.85)',border:'1px solid rgba(71,85,105,0.50)',color:'#f1f5f9',fontSize:'0.90rem' }}/>
                  </div>
                  <AnimatePresence>
                    {loginError && (
                      <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden'}}>
                        <div style={{ display:'flex',alignItems:'flex-start',gap:'8px',padding:'11px 13px',borderRadius:'10px',background:'rgba(239,68,68,0.09)',border:'1px solid rgba(239,68,68,0.22)',color:'#fca5a5',fontSize:'0.78rem' }}>
                          <AlertCircle size={13} style={{flexShrink:0,marginTop:'1px'}}/><span>{loginError}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button type="submit" disabled={loginLoading} whileHover={{scale:1.02,y:-1}} whileTap={{scale:0.98}}
                    style={{ width:'100%',padding:'14px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'0.95rem',fontFamily:'Syne,sans-serif',fontWeight:700,cursor:loginLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 0 28px rgba(99,102,241,0.35)',opacity:loginLoading?0.65:1 }}>
                    {loginLoading?<><Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> Signing in…</>:<><Lock size={16}/> Sign In</>}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}