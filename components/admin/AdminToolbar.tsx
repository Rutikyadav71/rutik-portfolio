'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit3, Eye, LogOut, Lock, CheckCircle, Loader2, Settings, Mail, KeyRound,
  AlertCircle, X, AlertTriangle, ExternalLink, Save as SaveIcon, Shield,
  Palette, Sliders, Type, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAdmin }     from '@/context/AdminContext'
import { usePortfolio } from '@/context/PortfolioContext'
import { useTheme, DEFAULT_THEME, ThemeSettings } from '@/context/ThemeContext'

// ─── Mini color input ─────────────────────────────────────────────────────────
function ColorRow({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',marginBottom:'10px' }}>
      <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em',flex:1 }}>{label}</span>
      <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
        <input type="color" value={value.startsWith('#') ? value : '#6366f1'}
          onChange={e => onChange(e.target.value)}
          style={{ width:'28px',height:'28px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.12)',background:'transparent',cursor:'pointer',padding:0 }}/>
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ width:'130px',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'6px',padding:'4px 7px',fontSize:'0.68rem',color:'#e2e8f0',outline:'none',fontFamily:'"JetBrains Mono",monospace' }}/>
      </div>
    </div>
  )
}

// ─── Mini slider ──────────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step, unit, onChange }: {
  label:string; value:number; min:number; max:number; step:number; unit?:string; onChange:(v:number)=>void
}) {
  return (
    <div style={{ marginBottom:'12px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'5px' }}>
        <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em' }}>{label}</span>
        <span style={{ fontSize:'0.68rem',color:'#818cf8',fontFamily:'"JetBrains Mono",monospace' }}>{value}{unit??''}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:'100%',accentColor:'#6366f1' }}/>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function ToggleRow({ label, value, onChange }: { label:string; value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px' }}>
      <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em' }}>{label}</span>
      <button onClick={() => onChange(!value)}
        style={{ width:'40px',height:'20px',borderRadius:'10px',background:value?'rgba(99,102,241,0.50)':'rgba(255,255,255,0.08)',border:`1px solid ${value?'rgba(99,102,241,0.70)':'rgba(255,255,255,0.12)'}`,cursor:'pointer',position:'relative',transition:'all 0.2s',padding:0 }}>
        <span style={{ position:'absolute',top:'2px',left:value?'21px':'2px',width:'14px',height:'14px',borderRadius:'50%',background:value?'#818cf8':'#64748b',transition:'left 0.2s',display:'block' }}/>
      </button>
    </div>
  )
}

// ─── Section accordion ────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, color='#818cf8' }: {
  title:string; icon:any; children:React.ReactNode; color?:string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:'1px solid rgba(255,255,255,0.05)',marginBottom:'2px' }}>
      <button onClick={() => setOpen(p=>!p)}
        style={{ width:'100%',display:'flex',alignItems:'center',gap:'8px',padding:'10px 0',background:'none',border:'none',cursor:'pointer',textAlign:'left' }}>
        <Icon size={13} color={color}/>
        <span style={{ flex:1,fontSize:'0.72rem',fontFamily:'Syne,sans-serif',fontWeight:600,color:'#e2e8f0' }}>{title}</span>
        {open ? <ChevronUp size={12} color="#475569"/> : <ChevronDown size={12} color="#475569"/>}
      </button>
      {open && <div style={{ paddingBottom:'12px' }}>{children}</div>}
    </div>
  )
}

// ─── Design Settings Panel ────────────────────────────────────────────────────
function DesignPanel({ onClose }: { onClose:()=>void }) {
  const { theme, updateTheme, resetTheme, saveThemeToCloud, themeSaving } = useTheme()
  const [saved, setSaved] = useState(false)

  const u = (patch: Partial<ThemeSettings>) => updateTheme(patch)

  const handleSave = async () => {
    await saveThemeToCloud()
    setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Reset ALL design settings to defaults? This cannot be undone.')) resetTheme()
  }

  return (
    <motion.div
      initial={{ opacity:0,x:20,scale:0.97 }} animate={{ opacity:1,x:0,scale:1 }} exit={{ opacity:0,x:20,scale:0.97 }}
      transition={{ duration:0.22,ease:[0.22,1,0.36,1] }}
      style={{
        position:'fixed',bottom:'82px',right:'82px',zIndex:9996,
        width:'320px',maxHeight:'75vh',
        background:'rgba(6,12,32,0.98)',border:'1px solid rgba(99,102,241,0.28)',
        borderRadius:'18px',backdropFilter:'blur(28px)',
        boxShadow:'0 0 60px rgba(99,102,241,0.12),0 32px 80px rgba(0,0,0,0.7)',
        display:'flex',flexDirection:'column',overflow:'hidden',
      }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:'8px',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0 }}>
        <Palette size={15} color="#818cf8"/>
        <span style={{ flex:1,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.88rem',color:'#f1f5f9' }}>Design Settings</span>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'6px',color:'#64748b',cursor:'pointer',width:'26px',height:'26px',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <X size={13}/>
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ overflowY:'auto',padding:'14px 16px',flex:1 }}>

        {/* Background */}
        <Section title="Background" icon={Sliders} color="#06b6d4">
          <ColorRow label="Base Color" value={theme.bgColor} onChange={v => u({ bgColor:v })}/>
          <ToggleRow label="Gradient" value={theme.bgGradientEnabled} onChange={v => u({ bgGradientEnabled:v })}/>
          {theme.bgGradientEnabled && <>
            <ColorRow label="Gradient Color 1" value={theme.bgGradient1} onChange={v => u({ bgGradient1:v })}/>
            <ColorRow label="Gradient Color 2" value={theme.bgGradient2} onChange={v => u({ bgGradient2:v })}/>
            <div style={{ marginBottom:'10px' }}>
              <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Direction</span>
              <div style={{ display:'flex',gap:'5px',flexWrap:'wrap' }}>
                {['to bottom','to right','135deg','to bottom right'].map(d => (
                  <button key={d} onClick={() => u({ bgGradientDir:d })}
                    style={{ padding:'3px 8px',borderRadius:'5px',fontSize:'0.60rem',fontFamily:'"JetBrains Mono",monospace',border:`1px solid ${theme.bgGradientDir===d?'rgba(99,102,241,0.70)':'rgba(255,255,255,0.08)'}`,background:theme.bgGradientDir===d?'rgba(99,102,241,0.20)':'rgba(255,255,255,0.02)',color:theme.bgGradientDir===d?'#818cf8':'#64748b',cursor:'pointer' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </>}
          <ToggleRow label="Glow Effect" value={theme.bgGlowEnabled} onChange={v => u({ bgGlowEnabled:v })}/>
          {theme.bgGlowEnabled && <ColorRow label="Glow Color" value={theme.bgGlowColor} onChange={v => u({ bgGlowColor:v })}/>}
        </Section>

        {/* Particles */}
        <Section title="Particles" icon={Sliders} color="#34d399">
          <ToggleRow label="Enable Particles" value={theme.particleEnabled} onChange={v => u({ particleEnabled:v })}/>
          {theme.particleEnabled && <>
            <div style={{ marginBottom:'12px' }}>
              <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Mode</span>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px' }}>
                {(['default','starfield','minimal','subtle-glow','low-motion'] as const).map(m => (
                  <button key={m} onClick={() => u({ particleMode:m })}
                    style={{ padding:'5px 8px',borderRadius:'6px',fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace',border:`1px solid ${theme.particleMode===m?'rgba(52,211,153,0.60)':'rgba(255,255,255,0.08)'}`,background:theme.particleMode===m?'rgba(52,211,153,0.14)':'rgba(255,255,255,0.02)',color:theme.particleMode===m?'#34d399':'#64748b',cursor:'pointer' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <SliderRow label="Density" value={theme.particleDensity} min={5000} max={30000} step={1000} onChange={v => u({ particleDensity:v })}/>
            <SliderRow label="Speed" value={theme.particleSpeed} min={0.05} max={1.0} step={0.05} onChange={v => u({ particleSpeed:v })}/>
            <SliderRow label="Size" value={theme.particleSize} min={0.5} max={5} step={0.1} onChange={v => u({ particleSize:v })}/>
            <SliderRow label="Opacity" value={theme.particleOpacity} min={0.1} max={1} step={0.02} onChange={v => u({ particleOpacity:v })}/>
          </>}
        </Section>

        {/* Navbar */}
        <Section title="Navbar" icon={Sliders} color="#f59e0b">
          <ColorRow label="Background" value={theme.navBg} onChange={v => u({ navBg:v })}/>
          <SliderRow label="Blur" value={theme.navBlur} min={0} max={40} step={1} unit="px" onChange={v => u({ navBlur:v })}/>
          <ColorRow label="Border" value={theme.navBorderColor} onChange={v => u({ navBorderColor:v })}/>
          <ColorRow label="Text" value={theme.navTextColor} onChange={v => u({ navTextColor:v })}/>
          <ColorRow label="Hover" value={theme.navHoverColor} onChange={v => u({ navHoverColor:v })}/>
          <ColorRow label="Active" value={theme.navActiveColor} onChange={v => u({ navActiveColor:v })}/>
        </Section>

        {/* Typography */}
        <Section title="Typography" icon={Type} color="#a78bfa">
          <div style={{ marginBottom:'10px' }}>
            <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Heading Font</span>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'5px' }}>
              {['Syne,sans-serif','"DM Sans",sans-serif','"JetBrains Mono",monospace','Georgia,serif','system-ui,sans-serif'].map(f => (
                <button key={f} onClick={() => u({ headingFont:f })}
                  style={{ padding:'4px 10px',borderRadius:'6px',fontSize:'0.65rem',fontFamily:f,border:`1px solid ${theme.headingFont===f?'rgba(167,139,250,0.60)':'rgba(255,255,255,0.08)'}`,background:theme.headingFont===f?'rgba(167,139,250,0.14)':'rgba(255,255,255,0.02)',color:theme.headingFont===f?'#a78bfa':'#64748b',cursor:'pointer' }}>
                  {f.split(',')[0].replace(/"/g,'')}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:'10px' }}>
            <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Body Font</span>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'5px' }}>
              {['"DM Sans",sans-serif','"JetBrains Mono",monospace','Georgia,serif','system-ui,sans-serif'].map(f => (
                <button key={f} onClick={() => u({ bodyFont:f, globalFont:f })}
                  style={{ padding:'4px 10px',borderRadius:'6px',fontSize:'0.65rem',fontFamily:f,border:`1px solid ${theme.bodyFont===f?'rgba(167,139,250,0.60)':'rgba(255,255,255,0.08)'}`,background:theme.bodyFont===f?'rgba(167,139,250,0.14)':'rgba(255,255,255,0.02)',color:theme.bodyFont===f?'#a78bfa':'#64748b',cursor:'pointer' }}>
                  {f.split(',')[0].replace(/"/g,'')}
                </button>
              ))}
            </div>
          </div>
          <SliderRow label="Base Font Size" value={parseFloat(theme.baseFontSize)} min={12} max={20} step={0.5} unit="px" onChange={v => u({ baseFontSize:String(v) })}/>
          <SliderRow label="Paragraph Spacing" value={parseFloat(theme.paragraphSpacing)} min={1.2} max={2.4} step={0.05} onChange={v => u({ paragraphSpacing:String(v) })}/>
        </Section>

        {/* Profile Frame */}
        <Section title="Profile Frame" icon={Palette} color="#ec4899">
          <ColorRow label="Border Color" value={theme.frameBorderColor} onChange={v => u({ frameBorderColor:v })}/>
          <SliderRow label="Border Thickness" value={theme.frameThickness} min={0} max={8} step={0.5} unit="px" onChange={v => u({ frameThickness:v })}/>
          <ColorRow label="Background" value={theme.frameBgColor} onChange={v => u({ frameBgColor:v })}/>
          <div style={{ marginBottom:'10px' }}>
            <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',display:'block',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.12em' }}>Glow Style</span>
            <div style={{ display:'flex',flexDirection:'column',gap:'4px' }}>
              {[
                { label:'Gradient (default)', val:'linear-gradient(135deg,rgba(99,102,241,0.70),rgba(6,182,212,0.60),rgba(139,92,246,0.65))' },
                { label:'Indigo', val:'linear-gradient(135deg,rgba(99,102,241,0.80),rgba(99,102,241,0.40))' },
                { label:'Cyan',   val:'linear-gradient(135deg,rgba(6,182,212,0.80),rgba(6,182,212,0.40))' },
                { label:'Gold',   val:'linear-gradient(135deg,rgba(245,158,11,0.80),rgba(251,191,36,0.40))' },
                { label:'None',   val:'transparent' },
              ].map(s => (
                <button key={s.label} onClick={() => u({ frameGlowGradient:s.val })}
                  style={{ display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',borderRadius:'7px',border:`1px solid ${theme.frameGlowGradient===s.val?'rgba(236,72,153,0.50)':'rgba(255,255,255,0.06)'}`,background:theme.frameGlowGradient===s.val?'rgba(236,72,153,0.10)':'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'left' }}>
                  <div style={{ width:14,height:14,borderRadius:'3px',background:s.val==='transparent'?'rgba(255,255,255,0.08)':s.val,flexShrink:0 }}/>
                  <span style={{ fontSize:'0.70rem',fontFamily:'"DM Sans",sans-serif',color:theme.frameGlowGradient===s.val?'#f1f5f9':'#64748b' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Footer: Save + Reset */}
      <div style={{ display:'flex',gap:'8px',padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0 }}>
        <button onClick={handleReset}
          style={{ display:'flex',alignItems:'center',gap:'5px',padding:'8px 12px',borderRadius:'8px',background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.28)',color:'#f87171',cursor:'pointer',fontSize:'0.72rem',fontFamily:'Syne,sans-serif',fontWeight:600 }}>
          <RotateCcw size={12}/> Reset
        </button>
        <button onClick={handleSave} disabled={themeSaving}
          style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'8px 14px',borderRadius:'8px',background:'rgba(52,211,153,0.14)',border:'1px solid rgba(52,211,153,0.35)',color:'#34d399',cursor:themeSaving?'wait':'pointer',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600 }}>
          {themeSaving ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : saved ? <CheckCircle size={13}/> : <SaveIcon size={13}/>}
          {themeSaving ? 'Saving…' : saved ? 'Saved!' : 'Save Design'}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Config warning panel ─────────────────────────────────────────────────────
function ConfigWarning({ onClose }: { onClose:()=>void }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL      || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const urlOk = url.startsWith('https://') && url.includes('.supabase.co')
  const keyOk = key.length > 20
  return (
    <motion.div
      initial={{ opacity:0,y:16,scale:0.95 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:16,scale:0.95 }}
      style={{ position:'fixed',bottom:'80px',right:'24px',zIndex:9998,width:'360px',maxWidth:'calc(100vw - 48px)',background:'rgba(8,15,40,0.96)',border:'1px solid rgba(251,191,36,0.35)',borderRadius:'18px',padding:'20px',backdropFilter:'blur(24px)',boxShadow:'0 0 40px rgba(251,191,36,0.12),0 20px 60px rgba(0,0,0,0.6)' }}>
      <button onClick={onClose} style={{ position:'absolute',top:'14px',right:'14px',padding:'4px',background:'none',border:'none',color:'#475569',cursor:'pointer' }}><X size={14}/></button>
      <div style={{ display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px' }}>
        <div style={{ padding:'8px',borderRadius:'10px',background:'rgba(251,191,36,0.10)',color:'#fbbf24' }}><AlertTriangle size={17}/></div>
        <div>
          <p style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:600,color:'#fff',fontSize:'0.88rem' }}>Supabase not configured</p>
          <p style={{ margin:'2px 0 0',color:'#64748b',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace' }}>Admin login requires env vars</p>
        </div>
      </div>
      {[{ ok:urlOk,label:'NEXT_PUBLIC_SUPABASE_URL',value:url||'(missing)' },{ ok:keyOk,label:'NEXT_PUBLIC_SUPABASE_ANON_KEY',value:key?key.slice(0,18)+'…':'(missing)' }].map(({ ok,label,value }) => (
        <div key={label} style={{ display:'flex',alignItems:'flex-start',gap:'8px',padding:'8px 10px',borderRadius:'10px',background:ok?'rgba(52,211,153,0.06)':'rgba(239,68,68,0.08)',border:`1px solid ${ok?'rgba(52,211,153,0.18)':'rgba(239,68,68,0.18)'}`,marginBottom:'6px' }}>
          <span style={{ color:ok?'#34d399':'#f87171',marginTop:'1px',flexShrink:0 }}>{ok?<CheckCircle size={11}/>:<AlertCircle size={11}/>}</span>
          <div><p style={{ margin:0,fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b' }}>{label}</p><p style={{ margin:'2px 0 0',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:ok?'#34d399':'#f87171' }}>{value}</p></div>
        </div>
      ))}
      <div style={{ background:'rgba(15,23,42,0.7)',borderRadius:'10px',padding:'10px 12px',marginBottom:'10px' }}>
        <p style={{ margin:'0 0 6px',fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b' }}>Add to .env.local:</p>
        <pre style={{ margin:0,fontSize:'0.67rem',color:'#34d399',lineHeight:1.7,overflowX:'auto' }}>{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...`}</pre>
      </div>
      <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
        style={{ display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'0.72rem',color:'#818cf8',textDecoration:'none' }}>
        <ExternalLink size={11}/> Open Supabase Dashboard
      </a>
    </motion.div>
  )
}

// ─── Main toolbar ─────────────────────────────────────────────────────────────
export default function AdminToolbar() {
  const { isAdmin, isEditMode, loading, supabaseReady, signIn, signOut, toggleEditMode } = useAdmin()
  const { saveToCloud, saving } = usePortfolio()

  const [showLogin,      setShowLogin]      = useState(false)
  const [showWarning,    setShowWarning]    = useState(false)
  const [showDesign,     setShowDesign]     = useState(false)
  const [email,          setEmail]          = useState('')
  const [password,       setPassword]       = useState('')
  const [loginLoading,   setLoginLoading]   = useState(false)
  const [loginError,     setLoginError]     = useState('')
  const [saved,          setSaved]          = useState(false)

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
    await saveToCloud()
    setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      {/* ── Gear button ── */}
      <motion.button
        initial={{ opacity:0,scale:0.5 }} animate={{ opacity:1,scale:1 }}
        transition={{ delay:2.5,type:'spring',stiffness:280,damping:22 }}
        onClick={isAdmin ? undefined : openLogin}
        title={isAdmin?'Admin active':'Admin Login'}
        style={{ position:'fixed',bottom:'24px',right:'24px',zIndex:9997,width:'46px',height:'46px',borderRadius:'13px',display:'flex',alignItems:'center',justifyContent:'center',background:isAdmin?'linear-gradient(135deg,rgba(52,211,153,0.18),rgba(6,182,212,0.18))':'rgba(8,15,40,0.88)',border:isAdmin?'1px solid rgba(52,211,153,0.45)':'1px solid rgba(99,102,241,0.28)',color:isAdmin?'#34d399':'#64748b',cursor:isAdmin?'default':'pointer',backdropFilter:'blur(16px)',boxShadow:isAdmin?'0 0 20px rgba(52,211,153,0.22),0 4px 20px rgba(0,0,0,0.5)':'0 4px 20px rgba(0,0,0,0.5)',transition:'all 0.3s ease' }}
        onMouseEnter={e=>{ if(!isAdmin)(e.currentTarget as HTMLElement).style.color='#818cf8' }}
        onMouseLeave={e=>{ if(!isAdmin)(e.currentTarget as HTMLElement).style.color='#64748b' }}>
        {isAdmin ? <Shield size={18}/> : <Settings size={18}/>}
      </motion.button>

      {/* ── Admin toolbar ── */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ y:80,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:80,opacity:0 }}
            transition={{ type:'spring',stiffness:280,damping:26 }}
            style={{ position:'fixed',bottom:'82px',right:'24px',zIndex:9996,display:'flex',flexDirection:'column',gap:'8px',alignItems:'flex-end' }}>
            {/* Status pill */}
            <div style={{ display:'flex',alignItems:'center',gap:'7px',padding:'5px 12px',borderRadius:'9999px',background:'rgba(8,15,40,0.90)',border:`1px solid ${isEditMode?'rgba(251,191,36,0.35)':'rgba(52,211,153,0.35)'}`,backdropFilter:'blur(16px)' }}>
              <motion.div animate={{ opacity:isEditMode?[1,0.3,1]:1 }} transition={{ duration:1.4,repeat:isEditMode?Infinity:0 }}
                style={{ width:7,height:7,borderRadius:'50%',background:isEditMode?'#fbbf24':'#34d399',boxShadow:`0 0 6px ${isEditMode?'#fbbf24':'#34d399'}` }}/>
              <span style={{ fontSize:'0.70rem',fontFamily:'"JetBrains Mono",monospace',color:isEditMode?'#fbbf24':'#34d399' }}>
                {isEditMode?'Edit Mode':'View Mode'}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex',gap:'8px',alignItems:'center' }}>
              {/* Design settings button — always visible when admin */}
              <motion.button onClick={() => setShowDesign(p=>!p)}
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                title="Design Settings"
                style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:showDesign?'rgba(99,102,241,0.20)':'rgba(99,102,241,0.10)',border:`1px solid ${showDesign?'rgba(99,102,241,0.55)':'rgba(99,102,241,0.28)'}`,color:'#818cf8',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                <Palette size={13}/> Design
              </motion.button>

              {isEditMode ? (
                <>
                  <motion.button onClick={handleSave} disabled={saving}
                    whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                    style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:'rgba(52,211,153,0.14)',border:'1px solid rgba(52,211,153,0.35)',color:'#34d399',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                    {saving?<Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>:saved?<CheckCircle size={13}/>:<SaveIcon size={13}/>}
                    {saving?'Saving…':saved?'Saved!':'Save'}
                  </motion.button>
                  <motion.button onClick={toggleEditMode}
                    whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                    style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:'rgba(8,15,40,0.88)',border:'1px solid rgba(71,85,105,0.45)',color:'#94a3b8',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:500,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                    <Eye size={13}/> Preview
                  </motion.button>
                </>
              ) : (
                <motion.button onClick={toggleEditMode}
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',background:'rgba(99,102,241,0.14)',border:'1px solid rgba(99,102,241,0.35)',color:'#818cf8',fontSize:'0.78rem',fontFamily:'Syne,sans-serif',fontWeight:600,cursor:'pointer',backdropFilter:'blur(16px)' }}>
                  <Edit3 size={13}/> Edit Portfolio
                </motion.button>
              )}

              <motion.button onClick={signOut}
                whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
                title="Sign out"
                style={{ display:'flex',alignItems:'center',justifyContent:'center',width:'36px',height:'36px',borderRadius:'10px',background:'rgba(8,15,40,0.88)',border:'1px solid rgba(71,85,105,0.35)',color:'#475569',cursor:'pointer',backdropFilter:'blur(16px)',transition:'all 0.2s' }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color='#f87171';(e.currentTarget as HTMLElement).style.borderColor='rgba(239,68,68,0.35)' }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color='#475569';(e.currentTarget as HTMLElement).style.borderColor='rgba(71,85,105,0.35)' }}>
                <LogOut size={14}/>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Design panel ── */}
      <AnimatePresence>
        {isAdmin && showDesign && <DesignPanel onClose={() => setShowDesign(false)}/>}
      </AnimatePresence>

      {/* ── Config warning ── */}
      <AnimatePresence>
        {showWarning && <ConfigWarning onClose={() => setShowWarning(false)}/>}
      </AnimatePresence>

      {/* ── Login modal ── */}
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowLogin(false)}
            style={{ position:'fixed',inset:0,zIndex:99998,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(12px)' }}>
            <motion.div initial={{ scale:0.88,opacity:0,y:32 }} animate={{ scale:1,opacity:1,y:0 }} exit={{ scale:0.88,opacity:0,y:32 }}
              transition={{ type:'spring',stiffness:320,damping:26 }}
              onClick={e => e.stopPropagation()}
              style={{ position:'relative',width:'100%',maxWidth:'400px' }}>
              <div style={{ position:'absolute',inset:'-20px',background:'radial-gradient(ellipse,rgba(99,102,241,0.20),transparent 70%)',borderRadius:'999px',pointerEvents:'none' }}/>
              <div style={{ position:'relative',background:'rgba(5,10,28,0.97)',border:'1px solid rgba(99,102,241,0.28)',borderRadius:'22px',padding:'36px',boxShadow:'0 0 60px rgba(99,102,241,0.18),0 30px 80px rgba(0,0,0,0.7)' }}>
                <button onClick={() => setShowLogin(false)}
                  style={{ position:'absolute',top:'16px',right:'16px',width:'30px',height:'30px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#475569',cursor:'pointer',transition:'all 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#fff'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#475569'}>
                  <X size={14}/>
                </button>
                <div style={{ display:'flex',alignItems:'center',gap:'14px',marginBottom:'28px' }}>
                  <motion.div animate={{ rotate:[0,-6,6,0] }} transition={{ duration:3,repeat:Infinity,repeatDelay:2 }}
                    style={{ width:'48px',height:'48px',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,rgba(99,102,241,0.20),rgba(139,92,246,0.15))',border:'1px solid rgba(99,102,241,0.30)',color:'#818cf8' }}>
                    <Lock size={22}/>
                  </motion.div>
                  <div>
                    <h2 style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'#f1f5f9' }}>Admin Login</h2>
                    <p style={{ margin:'3px 0 0',fontSize:'0.78rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569' }}>Sign in to access the edit mode</p>
                  </div>
                </div>
                <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
                  <div style={{ position:'relative' }}>
                    <Mail size={14} style={{ position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#475569',pointerEvents:'none',zIndex:2 }}/>
                    <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setLoginError('')}} placeholder="your@email.com" required autoFocus
                      style={{ width:'100%',boxSizing:'border-box',padding:'13px 14px 13px 38px',borderRadius:'12px',outline:'none',background:'rgba(15,23,42,0.85)',border:'1px solid rgba(71,85,105,0.50)',color:'#f1f5f9',fontSize:'0.90rem',fontFamily:'"DM Sans",sans-serif',transition:'border-color 0.2s,box-shadow 0.2s' }}
                      onFocus={e=>{(e.target as HTMLElement).style.borderColor='rgba(99,102,241,0.65)';(e.target as HTMLElement).style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'}}
                      onBlur={e=>{(e.target as HTMLElement).style.borderColor='rgba(71,85,105,0.50)';(e.target as HTMLElement).style.boxShadow='none'}}/>
                  </div>
                  <div style={{ position:'relative' }}>
                    <KeyRound size={14} style={{ position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#475569',pointerEvents:'none',zIndex:2 }}/>
                    <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setLoginError('')}} placeholder="Password" required
                      style={{ width:'100%',boxSizing:'border-box',padding:'13px 14px 13px 38px',borderRadius:'12px',outline:'none',background:'rgba(15,23,42,0.85)',border:'1px solid rgba(71,85,105,0.50)',color:'#f1f5f9',fontSize:'0.90rem',fontFamily:'"DM Sans",sans-serif',transition:'border-color 0.2s,box-shadow 0.2s' }}
                      onFocus={e=>{(e.target as HTMLElement).style.borderColor='rgba(99,102,241,0.65)';(e.target as HTMLElement).style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'}}
                      onBlur={e=>{(e.target as HTMLElement).style.borderColor='rgba(71,85,105,0.50)';(e.target as HTMLElement).style.boxShadow='none'}}/>
                  </div>
                  <AnimatePresence>
                    {loginError && (
                      <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }} style={{ overflow:'hidden' }}>
                        <div style={{ display:'flex',alignItems:'flex-start',gap:'8px',padding:'11px 13px',borderRadius:'10px',background:'rgba(239,68,68,0.09)',border:'1px solid rgba(239,68,68,0.22)',color:'#fca5a5',fontSize:'0.78rem' }}>
                          <AlertCircle size={13} style={{ flexShrink:0,marginTop:'1px' }}/>
                          <span style={{ fontFamily:'"DM Sans",sans-serif',lineHeight:1.5 }}>{loginError}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button type="submit" disabled={loginLoading} whileHover={{ scale:1.02,y:-1 }} whileTap={{ scale:0.98 }}
                    style={{ width:'100%',padding:'14px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'0.95rem',fontFamily:'Syne,sans-serif',fontWeight:700,cursor:loginLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 0 28px rgba(99,102,241,0.35)',opacity:loginLoading?0.65:1,transition:'opacity 0.2s',marginTop:'4px' }}>
                    {loginLoading?<><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Signing in…</>:<><Lock size={16}/> Sign In</>}
                  </motion.button>
                </form>
                <div style={{ marginTop:'20px',padding:'12px 14px',borderRadius:'12px',background:'rgba(15,23,42,0.60)',border:'1px solid rgba(30,41,59,0.80)' }}>
                  <p style={{ margin:0,color:'#475569',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace',lineHeight:1.7 }}>
                    Restricted access:<br/><span style={{ color:'#64748b' }}>administrator only.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}