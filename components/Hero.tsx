'use client'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { Github, Linkedin, Mail, ArrowDown, Download, Eye, Palette, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin }     from '@/context/AdminContext'
import { EditableText } from '@/components/admin/EditableText'
import dynamic from 'next/dynamic'

const PlanetLabel    = dynamic(() => import('@/components/PlanetLabel'),    { ssr:false, loading:()=>null })
const PlanetSelector = dynamic(() => import('@/components/PlanetSelector'), { ssr:false, loading:()=>null })

const SOCIALS = [
  { icon:Github,   href:'https://github.com/Rutikyadav71',               label:'GitHub'   },
  { icon:Linkedin, href:'https://linkedin.com/in/rutik-yadav-770159296', label:'LinkedIn' },
  { icon:Mail,     href:'mailto:rutikyadav2004@gmail.com',               label:'Email'    },
]

function toDownloadUrl(url: string): string {
  if (!url) return url
  const m = url.match(/\/file\/d\/([^/?#]+)/)
  if (m?.[1]) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  return url
}

const FONT_OPTS = [
  { label:'Syne',      value:'Syne,sans-serif' },
  { label:'DM Sans',   value:'"DM Sans",sans-serif' },
  { label:'Mono',      value:'"JetBrains Mono",monospace' },
  { label:'Serif',     value:'Georgia,serif' },
  { label:'System',    value:'system-ui,sans-serif' },
]
const DOT_SWATCHES = ['#6366f1','#06b6d4','#8b5cf6','#ec4899','#f1f5f9','#f59e0b']
const TXT_SWATCHES = ['#f1f5f9','#818cf8','#06b6d4','#34d399','#f59e0b','#ec4899']

function NameStylePanel({ ns, dotColor, onNsChange, onDotChange, onClose }: {
  ns:           { fontSize:string; fontFamily:string; color:string }
  dotColor:     string
  onNsChange:   (v:{ fontSize:string; fontFamily:string; color:string }) => void
  onDotChange:  (c:string) => void
  onClose:      () => void
}) {
  const parseRem = (v:string) => {
    const m = v.match(/(\d+(?:\.\d+)?)rem/)
    return m ? parseFloat(m[1]) : 5.5
  }
  const [sz,  setSz]  = useState(() => parseRem(ns.fontSize))
  const [col, setCol] = useState(ns.color)
  const [fnt, setFnt] = useState(ns.fontFamily)

  const emit = (s:number, c:string, f:string) =>
    onNsChange({ fontSize:`clamp(2.5rem,${(s*1.45).toFixed(1)}vw,${s}rem)`, fontFamily:f, color:c })

  return (
    <motion.div
      initial={{ opacity:0, y:-10, scale:0.96 }}
      animate={{ opacity:1, y:0,   scale:1 }}
      exit={{    opacity:0, y:-10, scale:0.96 }}
      transition={{ duration:0.22, ease:[0.22,1,0.36,1] }}
      style={{
        position:'absolute', top:'calc(100% + 14px)', left:0, zIndex:600,
        background:'rgba(6,12,32,0.99)', border:'1px solid rgba(99,102,241,0.35)',
        borderRadius:'18px', padding:'22px', width:'320px',
        boxShadow:'0 32px 80px rgba(0,0,0,0.70)',
      }}
    >
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <span style={{ fontSize:'0.68rem', fontFamily:'"JetBrains Mono",monospace', color:'#818cf8', textTransform:'uppercase', letterSpacing:'0.20em' }}>Name Style</span>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'6px', color:'#64748b', cursor:'pointer', width:'26px', height:'26px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X size={13}/>
        </button>
      </div>

      {/* size */}
      <div style={{ marginBottom:'18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
          <span style={{ fontSize:'0.62rem', fontFamily:'"JetBrains Mono",monospace', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Size</span>
          <span style={{ fontSize:'0.72rem', color:'#818cf8', fontFamily:'"JetBrains Mono",monospace' }}>{sz.toFixed(1)} rem</span>
        </div>
        <input type="range" min={2.5} max={8} step={0.1} value={sz}
          onChange={e => { const v=parseFloat(e.target.value); setSz(v); emit(v,col,fnt) }}
          style={{ width:'100%', accentColor:'#6366f1' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'3px' }}>
          <span style={{ fontSize:'0.58rem', color:'#334155', fontFamily:'"JetBrains Mono",monospace' }}>Small</span>
          <span style={{ fontSize:'0.58rem', color:'#334155', fontFamily:'"JetBrains Mono",monospace' }}>Large</span>
        </div>
      </div>

      {/* font */}
      <div style={{ marginBottom:'18px' }}>
        <p style={{ margin:'0 0 8px', fontSize:'0.62rem', fontFamily:'"JetBrains Mono",monospace', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Font Family</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {FONT_OPTS.map(f => (
            <button key={f.value} onClick={() => { setFnt(f.value); emit(sz,col,f.value) }}
              style={{ padding:'5px 11px', borderRadius:'7px', border:`1px solid ${fnt===f.value?'rgba(99,102,241,0.65)':'rgba(255,255,255,0.08)'}`, background:fnt===f.value?'rgba(99,102,241,0.20)':'rgba(255,255,255,0.03)', color:fnt===f.value?'#f1f5f9':'#64748b', cursor:'pointer', fontSize:'0.72rem', fontFamily:f.value, transition:'all 0.14s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* text color */}
      <div style={{ marginBottom:'18px' }}>
        <p style={{ margin:'0 0 8px', fontSize:'0.62rem', fontFamily:'"JetBrains Mono",monospace', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Text Color</p>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          {TXT_SWATCHES.map(c => (
            <button key={c} onClick={() => { setCol(c); emit(sz,c,fnt) }}
              style={{ width:'22px', height:'22px', borderRadius:'50%', background:c, border:`2.5px solid ${col===c?'#fff':'rgba(255,255,255,0.12)'}`, cursor:'pointer', transition:'transform 0.13s', transform:col===c?'scale(1.28)':'scale(1)', flexShrink:0 }}/>
          ))}
          <input type="color" value={col} onChange={e => { setCol(e.target.value); emit(sz,e.target.value,fnt) }}
            style={{ width:'26px', height:'26px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', cursor:'pointer', padding:0 }}/>
        </div>
      </div>

      {/* dot color */}
      <div>
        <p style={{ margin:'0 0 8px', fontSize:'0.62rem', fontFamily:'"JetBrains Mono",monospace', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Dot Color</p>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          {DOT_SWATCHES.map(c => (
            <button key={c} onClick={() => onDotChange(c)}
              style={{ width:'22px', height:'22px', borderRadius:'50%', background:c, border:`2.5px solid ${dotColor===c?'#fff':'rgba(255,255,255,0.12)'}`, cursor:'pointer', transition:'transform 0.13s', transform:dotColor===c?'scale(1.28)':'scale(1)', flexShrink:0 }}/>
          ))}
          <input type="color" value={dotColor} onChange={e => onDotChange(e.target.value)}
            style={{ width:'26px', height:'26px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', cursor:'pointer', padding:0 }}/>
        </div>
      </div>
    </motion.div>
  )
}

// ── Role / Typewriter Style Panel ────────────────────────────────────────────
function RoleStylePanel({ rs, onRsChange, onClose }: {
  rs:         { fontSize:string; fontFamily:string; color:string; useGradient:boolean }
  onRsChange: (v:{ fontSize:string; fontFamily:string; color:string; useGradient:boolean }) => void
  onClose:    () => void
}) {
  const parseRem = (v:string) => { const m=v.match(/(\d+(?:\.\d+)?)rem/); return m?parseFloat(m[1]):1.65 }
  const [sz,   setSz]   = useState(() => parseRem(rs.fontSize))
  const [col,  setCol]  = useState(rs.color)
  const [fnt,  setFnt]  = useState(rs.fontFamily)
  const [grad, setGrad] = useState(rs.useGradient)

  const emit = (s:number, c:string, f:string, g:boolean) =>
    onRsChange({ fontSize:`clamp(1rem,${(s*1.8).toFixed(1)}vw,${s}rem)`, fontFamily:f, color:c, useGradient:g })

  return (
    <motion.div
      initial={{ opacity:0,y:-10,scale:0.96 }}
      animate={{ opacity:1,y:0,scale:1 }}
      exit={{    opacity:0,y:-10,scale:0.96 }}
      transition={{ duration:0.22,ease:[0.22,1,0.36,1] }}
      style={{ position:'absolute',top:'calc(100% + 14px)',left:0,zIndex:600,background:'rgba(6,12,32,0.99)',border:'1px solid rgba(6,182,212,0.35)',borderRadius:'18px',padding:'22px',width:'320px',boxShadow:'0 32px 80px rgba(0,0,0,0.70)' }}
    >
      {/* header */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
        <span style={{ fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',color:'#06b6d4',textTransform:'uppercase',letterSpacing:'0.20em' }}>Role Text Style</span>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'6px',color:'#64748b',cursor:'pointer',width:'26px',height:'26px',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <X size={13}/>
        </button>
      </div>

      {/* gradient toggle */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px' }}>
        <span style={{ fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.14em' }}>Use Gradient</span>
        <button onClick={() => { const g=!grad; setGrad(g); emit(sz,col,fnt,g) }}
          style={{ width:'42px',height:'22px',borderRadius:'11px',background:grad?'rgba(6,182,212,0.45)':'rgba(255,255,255,0.08)',border:`1px solid ${grad?'rgba(6,182,212,0.65)':'rgba(255,255,255,0.12)'}`,cursor:'pointer',position:'relative',transition:'all 0.2s',padding:0,flexShrink:0 }}>
          <span style={{ position:'absolute',top:'2px',left:grad?'22px':'2px',width:'16px',height:'16px',borderRadius:'50%',background:grad?'#06b6d4':'#64748b',transition:'left 0.2s',display:'block' }}/>
        </button>
      </div>

      {/* size */}
      <div style={{ marginBottom:'18px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'8px' }}>
          <span style={{ fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.14em' }}>Size</span>
          <span style={{ fontSize:'0.72rem',color:'#06b6d4',fontFamily:'"JetBrains Mono",monospace' }}>{sz.toFixed(1)} rem</span>
        </div>
        <input type="range" min={0.9} max={3.5} step={0.05} value={sz}
          onChange={e=>{ const v=parseFloat(e.target.value); setSz(v); emit(v,col,fnt,grad) }}
          style={{ width:'100%',accentColor:'#06b6d4' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',marginTop:'3px' }}>
          <span style={{ fontSize:'0.58rem',color:'#334155',fontFamily:'"JetBrains Mono",monospace' }}>Small</span>
          <span style={{ fontSize:'0.58rem',color:'#334155',fontFamily:'"JetBrains Mono",monospace' }}>Large</span>
        </div>
      </div>

      {/* font */}
      <div style={{ marginBottom:'18px' }}>
        <p style={{ margin:'0 0 8px',fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.14em' }}>Font Family</p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:'6px' }}>
          {FONT_OPTS.map(f => (
            <button key={f.value} onClick={() => { setFnt(f.value); emit(sz,col,f.value,grad) }}
              style={{ padding:'5px 11px',borderRadius:'7px',border:`1px solid ${fnt===f.value?'rgba(6,182,212,0.65)':'rgba(255,255,255,0.08)'}`,background:fnt===f.value?'rgba(6,182,212,0.20)':'rgba(255,255,255,0.03)',color:fnt===f.value?'#f1f5f9':'#64748b',cursor:'pointer',fontSize:'0.72rem',fontFamily:f.value,transition:'all 0.14s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* color — only visible when gradient is OFF */}
      {!grad && (
        <div>
          <p style={{ margin:'0 0 8px',fontSize:'0.62rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.14em' }}>Text Color</p>
          <div style={{ display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap' }}>
            {TXT_SWATCHES.map(c => (
              <button key={c} onClick={() => { setCol(c); emit(sz,c,fnt,grad) }}
                style={{ width:'22px',height:'22px',borderRadius:'50%',background:c,border:`2.5px solid ${col===c?'#fff':'rgba(255,255,255,0.12)'}`,cursor:'pointer',transition:'transform 0.13s',transform:col===c?'scale(1.28)':'scale(1)',flexShrink:0 }}/>
            ))}
            <input type="color" value={col} onChange={e=>{ setCol(e.target.value); emit(sz,e.target.value,fnt,grad) }}
              style={{ width:'26px',height:'26px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',cursor:'pointer',padding:0 }}/>
          </div>
        </div>
      )}
    </motion.div>
  )
}


export default function Hero() {
  const { data, updateHero } = usePortfolio()
  const { isEditMode }       = useAdmin()
  const { hero }             = data
  const ref = useRef<HTMLElement>(null)
  const [showResume,     setShowResume]     = useState(false)
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [dotColor,       setDotColor]       = useState('#6366f1')

  const { scrollYProgress } = useScroll({ target:ref, offset:['start start','end start'] })
  const y       = useTransform(scrollYProgress, [0,1], [0,130])
  const opacity = useTransform(scrollYProgress, [0,0.55], [1,0])
  const typeSeq   = hero.roles.flatMap(r => [r, 2200]).flat()
  const resumeUrl = hero.resumeUrl ?? ''

  const nameStyle = hero.nameStyle ?? {
    fontSize:'clamp(3.2rem,8vw,5.5rem)', fontFamily:'Syne,sans-serif', color:'#f1f5f9',
  }
  const roleStyle = hero.roleStyle ?? {
    fontSize:'clamp(1.2rem,3vw,1.65rem)', fontFamily:'Syne,sans-serif', color:'#818cf8', useGradient:true,
  }
  const [showRolePanel, setShowRolePanel] = useState(false)

  return (
    <section id="hero" ref={ref} style={{ position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden',paddingTop:'80px',paddingBottom:'60px' }}>
      <PlanetLabel />
      <PlanetSelector />
      <motion.div style={{ y, opacity, width:'100%' }}>
        <div style={{ maxWidth:'82rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>
          <div style={{ maxWidth:'600px',display:'flex',flexDirection:'column',gap:'24px' }}>

            {/* Available badge */}
            <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5,delay:0.15 }}
              style={{ display:'flex',alignItems:'center',gap:'8px',alignSelf:'flex-start',padding:'6px 14px',borderRadius:'9999px',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.22)' }}>
              <motion.div animate={{ opacity:[1,0.3,1],scale:[1,0.8,1] }} transition={{ duration:2,repeat:Infinity }}
                style={{ width:6,height:6,borderRadius:'50%',background:'#34d399',boxShadow:'0 0 8px #34d399' }}/>
              <span style={{ fontSize:'0.78rem',color:'#34d399',fontFamily:'"JetBrains Mono",monospace',letterSpacing:'0.06em' }}>
                ✦ Available for opportunities
              </span>
            </motion.div>

            {/* ── Name heading + style editor ──────────────────────────────── */}
            <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,delay:0.2 }}
              style={{ position:'relative' }}>

              {/* Style editor toggle — only in edit mode */}
              {isEditMode && (
                <button
                  onClick={() => setShowStylePanel(p => !p)}
                  style={{
                    position:'absolute', top:'-12px', right:0, zIndex:10,
                    display:'inline-flex', alignItems:'center', gap:'5px',
                    padding:'5px 11px', borderRadius:'8px',
                    background: showStylePanel ? 'rgba(99,102,241,0.24)' : 'rgba(99,102,241,0.10)',
                    border:`1px solid ${showStylePanel ? 'rgba(99,102,241,0.65)' : 'rgba(99,102,241,0.28)'}`,
                    color:'#818cf8', cursor:'pointer', fontSize:'0.67rem',
                    fontFamily:'"JetBrains Mono",monospace', letterSpacing:'0.10em',
                    textTransform:'uppercase', transition:'all 0.17s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.22)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background=showStylePanel?'rgba(99,102,241,0.24)':'rgba(99,102,241,0.10)'}
                >
                  <Palette size={11}/> Style Name
                </button>
              )}

              {/* Name */}
              <h1 style={{
                fontFamily:    nameStyle.fontFamily,
                fontWeight:    900,
                fontSize:      nameStyle.fontSize,
                color:         nameStyle.color,
                margin:        0,
                lineHeight:    0.96,
                letterSpacing: '-0.02em',
              }}>
                <EditableText value={hero.name} onChange={v => updateHero({ name:v })} as="span"/>
                <span style={{ color:dotColor }}>.</span>
              </h1>

              {/* Style panel */}
              <AnimatePresence>
                {isEditMode && showStylePanel && (
                  <NameStylePanel
                    ns={nameStyle}
                    dotColor={dotColor}
                    onNsChange={s => updateHero({ nameStyle:s })}
                    onDotChange={setDotColor}
                    onClose={() => setShowStylePanel(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Role typewriter — style-editable in edit mode */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
              style={{ position:'relative' }}>

              {isEditMode && (
                <button
                  onClick={() => setShowRolePanel(p=>!p)}
                  style={{
                    position:'absolute', top:'-12px', right:0, zIndex:10,
                    display:'inline-flex', alignItems:'center', gap:'5px',
                    padding:'5px 11px', borderRadius:'8px',
                    background: showRolePanel ? 'rgba(6,182,212,0.24)' : 'rgba(6,182,212,0.10)',
                    border:`1px solid ${showRolePanel ? 'rgba(6,182,212,0.65)' : 'rgba(6,182,212,0.28)'}`,
                    color:'#06b6d4', cursor:'pointer', fontSize:'0.67rem',
                    fontFamily:'"JetBrains Mono",monospace', letterSpacing:'0.10em',
                    textTransform:'uppercase', transition:'all 0.17s',
                  }}>
                  <Palette size={11}/> Style Role
                </button>
              )}

              <TypeAnimation sequence={typeSeq} wrapper="h2" speed={52} repeat={Infinity}
                style={{
                  fontFamily: roleStyle.fontFamily,
                  fontWeight: 700,
                  fontSize:   roleStyle.fontSize,
                  ...(roleStyle.useGradient
                    ? { background:'linear-gradient(135deg,#06b6d4,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }
                    : { color: roleStyle.color }),
                  margin:0,
                }}/>

              <AnimatePresence>
                {isEditMode && showRolePanel && (
                  <RoleStylePanel
                    rs={roleStyle}
                    onRsChange={s => updateHero({ roleStyle:s })}
                    onClose={() => setShowRolePanel(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tagline */}
            <motion.p initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5,delay:0.42 }}
              style={{ margin:0,color:'#64748b',fontSize:'1.02rem',lineHeight:1.72,fontFamily:'"DM Sans",sans-serif',maxWidth:'520px' }}>
              <EditableText value={hero.tagline} onChange={v=>updateHero({ tagline:v })} as="span" multiline/>
            </motion.p>

            {/* Location */}
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.48 }}
              style={{ margin:0,display:'flex',alignItems:'center',gap:'6px',color:'#475569',fontSize:'0.88rem',fontFamily:'"JetBrains Mono",monospace' }}>
              <span style={{ fontSize:'1rem' }}>📍</span>
              <EditableText value={hero.location} onChange={v=>updateHero({ location:v })} as="span"/>
            </motion.p>

            {/* Stats */}
            {/* <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.55,delay:0.55 }}
              style={{ alignSelf:'flex-start',display:'flex',alignItems:'center',gap:'20px',padding:'14px 24px',borderRadius:'16px',background:'rgba(8,15,40,0.70)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.06)' }}>
              <Stat value="8.13" label="CGPA"/>
              <div style={SEP}/>
              <Stat value="2+" label="Projects"/>
              <div style={SEP}/>
              <Stat value="1" label="Internship"/>
              <div style={SEP}/>
              <Stat value="2026" label="Graduating"/>
            </motion.div> */}

            {/* CTA buttons */}
            <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5,delay:0.64 }}
              style={{ display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'center' }}>
              <motion.button
                onClick={()=>document.getElementById('projects')?.scrollIntoView({ behavior:'smooth' })}
                whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:0.97 }}
                style={{ display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 28px',borderRadius:'14px',border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'1rem',fontFamily:'Syne,sans-serif',fontWeight:600,boxShadow:'0 0 32px rgba(99,102,241,0.40)' }}>
                View My Work &rarr;
              </motion.button>

              <motion.button
                onClick={()=>{ if(!resumeUrl){ alert('No resume URL set yet.\n\nGo to Edit Mode → click "Resume ✎" in the navbar.'); return } setShowResume(true) }}
                whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:0.97 }}
                style={{ display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 22px',borderRadius:'14px',border:'1px solid rgba(99,102,241,0.45)',cursor:'pointer',background:'transparent',color:'#818cf8',fontSize:'1rem',fontFamily:'Syne,sans-serif',fontWeight:600 }}>
                <Eye size={16}/> View CV
              </motion.button>

              {resumeUrl && (
                <motion.a href={toDownloadUrl(resumeUrl)} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:0.97 }}
                  style={{ display:'inline-flex',alignItems:'center',gap:'6px',padding:'12px 16px',borderRadius:'14px',textDecoration:'none',cursor:'pointer',background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.22)',color:'#64748b',fontSize:'0.88rem',fontFamily:'Syne,sans-serif',fontWeight:500 }}>
                  <Download size={14}/>
                </motion.a>
              )}
            </motion.div>

            {/* Socials */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.74 }}
              style={{ display:'flex',alignItems:'center',gap:'10px' }}>
              {SOCIALS.map(({ icon:Icon,href,label },i) => (
                <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  initial={{ opacity:0,scale:0.5 }} animate={{ opacity:1,scale:1 }}
                  transition={{ delay:0.78+i*0.08,type:'spring',stiffness:360 }}
                  whileHover={{ scale:1.2,y:-4 }} whileTap={{ scale:0.92 }}
                  style={{ display:'flex',alignItems:'center',justifyContent:'center',width:'44px',height:'44px',borderRadius:'12px',background:'rgba(8,15,40,0.70)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.06)',color:'#94a3b8',textDecoration:'none',transition:'color 0.2s,border-color 0.2s,box-shadow 0.2s' }}
                  onMouseEnter={e=>{ const el=e.currentTarget as HTMLAnchorElement;el.style.color='#f1f5f9';el.style.borderColor='rgba(99,102,241,0.45)';el.style.boxShadow='0 0 20px rgba(99,102,241,0.25)' }}
                  onMouseLeave={e=>{ const el=e.currentTarget as HTMLAnchorElement;el.style.color='#94a3b8';el.style.borderColor='rgba(255,255,255,0.06)';el.style.boxShadow='none' }}>
                  <Icon size={19}/>
                </motion.a>
              ))}
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2.1 }}
        onClick={()=>document.getElementById('about')?.scrollIntoView({ behavior:'smooth' })}
        style={{ position:'absolute',bottom:'32px',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',background:'transparent',border:'none',color:'#475569',cursor:'pointer',fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',letterSpacing:'0.14em',textTransform:'uppercase' }}>
        <span>scroll</span>
        <motion.div animate={{ y:[0,6,0] }} transition={{ duration:1.7,repeat:Infinity,ease:'easeInOut' }}>
          <ArrowDown size={14}/>
        </motion.div>
      </motion.button>

      {/* Resume modal */}
      {showResume && resumeUrl && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(10px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px' }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowResume(false) }}>
          <motion.div initial={{ scale:0.92,opacity:0 }} animate={{ scale:1,opacity:1 }}
            style={{ width:'100%',maxWidth:'900px',height:'90vh',display:'flex',flexDirection:'column',background:'rgba(8,15,40,0.98)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'20px',overflow:'hidden' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0 }}>
              <span style={{ fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.95rem',color:'#f1f5f9',flex:1 }}>
                {hero.name} &mdash; Resume
              </span>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'9px',background:'rgba(99,102,241,0.15)',color:'#818cf8',fontSize:'0.78rem',fontFamily:'"JetBrains Mono",monospace',textDecoration:'none',border:'1px solid rgba(99,102,241,0.25)' }}>
                Open in tab
              </a>
              <a href={toDownloadUrl(resumeUrl)} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'9px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'0.78rem',fontFamily:'"JetBrains Mono",monospace',textDecoration:'none' }}>
                <Download size={13}/> Download
              </a>
              <button onClick={()=>setShowResume(false)}
                style={{ background:'transparent',border:'none',color:'#64748b',cursor:'pointer',fontSize:'1.1rem',padding:'4px 8px' }}>&#10005;</button>
            </div>
            <div style={{ flex:1,overflow:'hidden' }}>
              <iframe
                src={resumeUrl.includes('drive.google.com') ? resumeUrl.replace('/view','/preview') : resumeUrl}
                style={{ width:'100%',height:'100%',border:'none' }} title="Resume"/>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}