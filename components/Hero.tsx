'use client'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { Github, Linkedin, Mail, Twitter, Instagram, Youtube, Globe, MessageSquare, Send, Phone, Link as LinkIcon, ArrowDown, Download, Eye, Palette, X, Plus, Trash2, Settings2, RotateCcw, GripHorizontal } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { usePortfolio } from '@/context/PortfolioContext'
import type { SocialLink, SocialIconType } from '@/context/PortfolioContext'
import { useAdmin }     from '@/context/AdminContext'
import { useTheme }     from '@/context/ThemeContext'
import { EditableText } from '@/components/admin/EditableText'
import dynamic from 'next/dynamic'

const PlanetLabel    = dynamic(() => import('@/components/PlanetLabel'),    { ssr:false, loading:()=>null })
const PlanetSelector = dynamic(() => import('@/components/PlanetSelector'), { ssr:false, loading:()=>null })

// ── Social icon map ──────────────────────────────────────────────────────────
const SOCIAL_ICON_MAP: Record<string, React.ElementType> = {
  github: Github, linkedin: Linkedin, mail: Mail, twitter: Twitter,
  instagram: Instagram, youtube: Youtube, globe: Globe,
  discord: MessageSquare, telegram: Send, whatsapp: Phone, link: LinkIcon,
}
const SOCIAL_PRESETS = [
  { type:'github',    label:'GitHub',    placeholder:'https://github.com/username'           },
  { type:'linkedin',  label:'LinkedIn',  placeholder:'https://linkedin.com/in/username'      },
  { type:'mail',      label:'Email',     placeholder:'mailto:you@email.com'                  },
  { type:'twitter',   label:'Twitter/X', placeholder:'https://twitter.com/username'          },
  { type:'instagram', label:'Instagram', placeholder:'https://instagram.com/username'        },
  { type:'youtube',   label:'YouTube',   placeholder:'https://youtube.com/@channel'          },
  { type:'globe',     label:'Website',   placeholder:'https://yoursite.com'                  },
  { type:'discord',   label:'Discord',   placeholder:'https://discord.gg/invite'             },
  { type:'telegram',  label:'Telegram',  placeholder:'https://t.me/username'                 },
  { type:'whatsapp',  label:'WhatsApp',  placeholder:'https://wa.me/91XXXXXXXXXX'            },
  { type:'link',      label:'Custom',    placeholder:'https://...'                           },
]
const DEFAULT_SOCIAL_STYLE = {
  size:44, iconSize:19,
  bg:'rgba(8,15,40,0.70)', border:'rgba(255,255,255,0.06)',
  color:'#94a3b8', hoverColor:'#f1f5f9',
  borderRadius:12, gap:10,
}

function toDownloadUrl(url:string):string {
  if (!url) return url
  const m = url.match(/\/file\/d\/([^/?#]+)/)
  if (m?.[1]) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  return url
}

// ── Expanded font options with all loaded fonts ───────────────────────────────
const NAME_FONT_OPTS = [
  { label:'Syne',          value:'Syne,sans-serif',                  weight:900 },
  { label:'Inter',         value:'"Inter",sans-serif',               weight:900 },
  { label:'Outfit',        value:'"Outfit",sans-serif',              weight:900 },
  { label:'Space Grotesk', value:'"Space Grotesk",sans-serif',       weight:700 },
  { label:'DM Sans',       value:'"DM Sans",sans-serif',             weight:700 },
  { label:'Playfair',      value:'"Playfair Display",serif',         weight:900 },
  { label:'Exo 2',         value:'"Exo 2",sans-serif',               weight:900 },
  { label:'Rajdhani',      value:'Rajdhani,sans-serif',              weight:700 },
  { label:'Bebas Neue',    value:'"Bebas Neue",sans-serif',          weight:400 },
  { label:'Mono',          value:'"JetBrains Mono",monospace',       weight:700 },
  { label:'Georgia',       value:'Georgia,serif',                    weight:700 },
  { label:'System',        value:'system-ui,sans-serif',             weight:900 },
]
const ROLE_FONT_OPTS = [
  { label:'Syne',          value:'Syne,sans-serif'             },
  { label:'Inter',         value:'"Inter",sans-serif'          },
  { label:'Outfit',        value:'"Outfit",sans-serif'         },
  { label:'Space Grotesk', value:'"Space Grotesk",sans-serif'  },
  { label:'DM Sans',       value:'"DM Sans",sans-serif'        },
  { label:'Playfair',      value:'"Playfair Display",serif'    },
  { label:'Rajdhani',      value:'Rajdhani,sans-serif'         },
  { label:'Mono',          value:'"JetBrains Mono",monospace'  },
  { label:'Georgia',       value:'Georgia,serif'               },
  { label:'System',        value:'system-ui,sans-serif'        },
]

const SWATCHES = ['#f1f5f9','#34d399','#818cf8','#06b6d4','#f59e0b','#ec4899','#a3e635','#fb923c']
const DOT_SW   = ['#6366f1','#06b6d4','#8b5cf6','#ec4899','#34d399','#f59e0b','#f1f5f9']
const ANIM_OPTS= [
  { v:'typewriter' as const, label:'Typewriter', desc:'Types each character one by one' },
  { v:'fade'       as const, label:'Fade',       desc:'Smooth cross-fade transition'    },
  { v:'slide'      as const, label:'Slide Up',   desc:'Slides in from below'            },
  { v:'bounce'     as const, label:'Bounce',     desc:'Spring physics entrance'          },
]

// ── Draggable panel shell (fixed position, drag by header) ────────────────────
function PanelShell({ border, title, accentColor, onClose, children, initialX, initialY }:{
  border:string; title:string; accentColor:string; onClose:()=>void; children:React.ReactNode
  initialX?:number; initialY?:number
}) {
  const panelRef  = useRef<HTMLDivElement>(null)
  const dragging  = useRef(false)
  const origin    = useRef({ mx:0, my:0, px:0, py:0 })
  const posRef    = useRef({ x:0, y:0 })

  // Set initial position on mount (client-only)
  useEffect(() => {
    const x = initialX ?? Math.max(20, (window.innerWidth  - 380) / 2)
    const y = initialY ?? Math.max(80, (window.innerHeight - 500) / 4)
    posRef.current = { x, y }
    if (panelRef.current) {
      panelRef.current.style.left = `${x}px`
      panelRef.current.style.top  = `${y}px`
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, px: posRef.current.x, py: posRef.current.y }
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !panelRef.current) return
      const nx = origin.current.px + (ev.clientX - origin.current.mx)
      const ny = origin.current.py + (ev.clientY - origin.current.my)
      const el = panelRef.current
      const maxX = window.innerWidth  - el.offsetWidth
      const maxY = window.innerHeight - el.offsetHeight
      posRef.current = { x: Math.max(0, Math.min(nx, maxX)), y: Math.max(0, Math.min(ny, maxY)) }
      el.style.left = `${posRef.current.x}px`
      el.style.top  = `${posRef.current.y}px`
    }
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <motion.div ref={panelRef}
      initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}}
      exit={{opacity:0,scale:0.97}} transition={{duration:0.18,ease:[0.22,1,0.36,1]}}
      style={{
        position:'fixed', zIndex:8000,
        left:`${posRef.current.x}px`, top:`${posRef.current.y}px`,
        background:'rgba(5,10,28,0.99)', border:`1px solid ${border}`,
        borderRadius:'18px', width:'360px',
        boxShadow:'0 32px 90px rgba(0,0,0,0.75)', maxHeight:'80vh', overflowY:'auto',
        userSelect:'none',
      }}>
      {/* Drag handle header */}
      <div onMouseDown={onHeaderMouseDown}
        style={{display:'flex',alignItems:'center',gap:'8px',padding:'14px 18px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)',cursor:'grab',background:'rgba(255,255,255,0.02)',borderRadius:'18px 18px 0 0',flexShrink:0}}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="rgba(100,116,139,0.6)">
          <circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/>
          <circle cx="2" cy="5" r="1.2"/><circle cx="8" cy="5" r="1.2"/>
          <circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/>
        </svg>
        <span style={{flex:1,fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:accentColor,textTransform:'uppercase',letterSpacing:'0.20em'}}>{title}</span>
        <span style={{fontSize:'0.52rem',color:'#334155',fontFamily:'"JetBrains Mono",monospace'}}>drag</span>
        <button onClick={onClose} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'6px',color:'#64748b',cursor:'pointer',width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <X size={12}/>
        </button>
      </div>
      {/* Scrollable content */}
      <div style={{padding:'18px 22px', overflowY:'auto', maxHeight:'calc(80vh - 56px)'}}>
        {children}
      </div>
    </motion.div>
  )
}
function Label({c='#475569',children}:{c?:string;children:React.ReactNode}) {
  return <p style={{margin:'0 0 7px',fontSize:'0.60rem',fontFamily:'"JetBrains Mono",monospace',color:c,textTransform:'uppercase',letterSpacing:'0.14em'}}>{children}</p>
}
function Divider() { return <div style={{height:'1px',background:'rgba(255,255,255,0.06)',margin:'14px 0'}}/> }

function SwatchRow({values,value,onChange}:{values:string[];value:string;onChange:(v:string)=>void}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
      {values.map(c=>(
        <button key={c} onClick={()=>onChange(c)}
          style={{width:'22px',height:'22px',borderRadius:'50%',background:c,border:`2px solid ${value===c?'#fff':'rgba(255,255,255,0.12)'}`,cursor:'pointer',transform:value===c?'scale(1.22)':'scale(1)',transition:'transform 0.12s',flexShrink:0}}/>
      ))}
      <input type="color" value={value.startsWith('#')?value:'#f1f5f9'} onChange={e=>onChange(e.target.value)}
        style={{width:'24px',height:'24px',borderRadius:'5px',border:'1px solid rgba(255,255,255,0.15)',background:'transparent',cursor:'pointer',padding:0}}/>
      <input value={value} onChange={e=>onChange(e.target.value)}
        style={{flex:1,minWidth:'70px',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.22)',borderRadius:'6px',padding:'3px 7px',fontSize:'0.63rem',color:'#e2e8f0',outline:'none',fontFamily:'"JetBrains Mono",monospace'}}/>
    </div>
  )
}

// ── NAME STYLE PANEL ──────────────────────────────────────────────────────────
function NamePanel({ns,dotColor,onNsChange,onDotChange,onClose}:{
  ns:{fontSize:string;fontFamily:string;color:string;fontWeight?:string}
  dotColor:string; onNsChange:(v:{fontSize:string;fontFamily:string;color:string;fontWeight:string})=>void
  onDotChange:(c:string)=>void; onClose:()=>void
}) {
  const parseRem=(v:string)=>{ const m=v.match(/(\d+(?:\.\d+)?)rem/); return m?parseFloat(m[1]):5.5 }
  const [sz,  setSz]  = useState(()=>parseRem(ns.fontSize))
  const [col, setCol] = useState(ns.color)
  const [fnt, setFnt] = useState(ns.fontFamily)

  const emit=(s:number,c:string,f:string)=>{
    const chosen = NAME_FONT_OPTS.find(o=>o.value===f)
    const w = chosen?.weight ?? 900
    onNsChange({ fontSize:`clamp(2.5rem,${(s*1.45).toFixed(1)}vw,${s}rem)`, fontFamily:f, color:c, fontWeight:String(w) })
  }

  return (
    <PanelShell border="rgba(99,102,241,0.35)" title="Name Style" accentColor="#818cf8" onClose={onClose}
      initialX={40} initialY={120}>
      {/* Font family */}
      <div style={{marginBottom:'14px'}}>
        <Label>Font Family</Label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px'}}>
          {NAME_FONT_OPTS.map(f=>(
            <button key={f.value} onClick={()=>{setFnt(f.value);emit(sz,col,f.value)}}
              style={{padding:'6px 10px',borderRadius:'7px',border:`1px solid ${fnt===f.value?'rgba(99,102,241,0.60)':'rgba(255,255,255,0.07)'}`,background:fnt===f.value?'rgba(99,102,241,0.18)':'rgba(255,255,255,0.02)',color:fnt===f.value?'#f1f5f9':'#94a3b8',cursor:'pointer',fontSize:'0.72rem',fontFamily:f.value,fontWeight:f.weight,textAlign:'left',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div style={{marginBottom:'14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
          <Label>Size</Label>
          <span style={{fontSize:'0.65rem',color:'#818cf8',fontFamily:'"JetBrains Mono",monospace'}}>{sz.toFixed(1)} rem</span>
        </div>
        <input type="range" min={2.5} max={8} step={0.1} value={sz}
          onChange={e=>{const v=parseFloat(e.target.value);setSz(v);emit(v,col,fnt)}}
          style={{width:'100%',accentColor:'#6366f1'}}/>
      </div>

      {/* Text color */}
      <div style={{marginBottom:'14px'}}>
        <Label>Text Color</Label>
        <SwatchRow values={SWATCHES} value={col} onChange={c=>{setCol(c);emit(sz,c,fnt)}}/>
      </div>

      {/* Dot color */}
      <div>
        <Label>Dot Color</Label>
        <SwatchRow values={DOT_SW} value={dotColor} onChange={onDotChange}/>
      </div>

      {/* Live preview */}
      <Divider/>
      <div style={{padding:'8px',borderRadius:'10px',background:'rgba(0,0,0,0.3)'}}>
        <Label c="#334155">Preview</Label>
        <div style={{fontFamily:fnt,fontWeight:NAME_FONT_OPTS.find(o=>o.value===fnt)?.weight??900,fontSize:`${sz*0.45}rem`,color:col,lineHeight:1}}>
          Rutik Yadav<span style={{color:dotColor}}>.</span>
        </div>
      </div>
    </PanelShell>
  )
}

// ── ROLE EDITOR PANEL ─────────────────────────────────────────────────────────
function RolePanel({roles,animStyle,rs,onRolesChange,onAnimChange,onRsChange,onClose}:{
  roles:string[]; animStyle:'typewriter'|'fade'|'slide'|'bounce'
  rs:{fontSize:string;fontFamily:string;color:string;useGradient:boolean}
  onRolesChange:(r:string[])=>void; onAnimChange:(v:'typewriter'|'fade'|'slide'|'bounce')=>void
  onRsChange:(v:{fontSize:string;fontFamily:string;color:string;useGradient:boolean})=>void
  onClose:()=>void
}) {
  const parseRem=(v:string)=>{ const m=v.match(/(\d+(?:\.\d+)?)rem/); return m?parseFloat(m[1]):1.65 }
  const [sz,   setSz]  = useState(()=>parseRem(rs.fontSize))
  const [col,  setCol] = useState(rs.color)
  const [fnt,  setFnt] = useState(rs.fontFamily)
  const [grad, setGrad]= useState(rs.useGradient)
  const [loc,  setLoc] = useState(roles)

  const emitS=(s:number,c:string,f:string,g:boolean)=>
    onRsChange({fontSize:`clamp(1rem,${(s*1.8).toFixed(1)}vw,${s}rem)`,fontFamily:f,color:c,useGradient:g})
  const updRole=(i:number,v:string)=>{ const n=loc.map((r,j)=>j===i?v:r); setLoc(n); onRolesChange(n) }
  const addRole=()=>{ const n=[...loc,'New Role']; setLoc(n); onRolesChange(n) }
  const delRole=(i:number)=>{ if(loc.length<=1) return; const n=loc.filter((_,j)=>j!==i); setLoc(n); onRolesChange(n) }

  return (
    <PanelShell border="rgba(6,182,212,0.35)" title="Role Text Editor" accentColor="#06b6d4" onClose={onClose}
      initialX={440} initialY={120}>
      {/* Role list */}
      <div style={{marginBottom:'14px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
          <Label>Role Texts</Label>
          <button onClick={addRole} style={{display:'flex',alignItems:'center',gap:'4px',padding:'3px 9px',borderRadius:'6px',background:'rgba(6,182,212,0.15)',border:'1px solid rgba(6,182,212,0.35)',color:'#06b6d4',cursor:'pointer',fontSize:'0.63rem'}}>
            <Plus size={10}/> Add
          </button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
          {loc.map((r,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <span style={{width:'16px',fontSize:'0.60rem',color:'#475569',textAlign:'center',fontFamily:'"JetBrains Mono",monospace'}}>{i+1}</span>
              <input value={r} onChange={e=>updRole(i,e.target.value)}
                style={{flex:1,background:'rgba(15,23,42,0.8)',border:'1px solid rgba(6,182,212,0.22)',borderRadius:'7px',padding:'6px 9px',fontSize:'0.78rem',color:'#e2e8f0',outline:'none'}}/>
              <button onClick={()=>delRole(i)} disabled={loc.length<=1}
                style={{width:'24px',height:'24px',borderRadius:'6px',background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.20)',color:'#f87171',cursor:loc.length<=1?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:loc.length<=1?0.3:1}}>
                <Trash2 size={11}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Divider/>

      {/* Animation style */}
      <div style={{marginBottom:'14px'}}>
        <Label>Animation Style</Label>
        <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
          {ANIM_OPTS.map(a=>(
            <button key={a.v} onClick={()=>onAnimChange(a.v)}
              style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'8px',border:`1px solid ${animStyle===a.v?'rgba(6,182,212,0.55)':'rgba(255,255,255,0.06)'}`,background:animStyle===a.v?'rgba(6,182,212,0.12)':'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'left'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:animStyle===a.v?'#06b6d4':'#334155',flexShrink:0}}/>
              <div>
                <p style={{margin:0,fontSize:'0.75rem',color:animStyle===a.v?'#f1f5f9':'#94a3b8',fontWeight:600}}>{a.label}</p>
                <p style={{margin:0,fontSize:'0.60rem',color:'#475569',fontFamily:'"JetBrains Mono",monospace'}}>{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Divider/>

      {/* Style controls */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
        <Label>Gradient Color</Label>
        <button onClick={()=>{const g=!grad;setGrad(g);emitS(sz,col,fnt,g)}}
          style={{width:'40px',height:'20px',borderRadius:'10px',background:grad?'rgba(6,182,212,0.45)':'rgba(255,255,255,0.08)',border:`1px solid ${grad?'rgba(6,182,212,0.60)':'rgba(255,255,255,0.12)'}`,cursor:'pointer',position:'relative',padding:0}}>
          <span style={{position:'absolute',top:'2px',left:grad?'21px':'2px',width:'14px',height:'14px',borderRadius:'50%',background:grad?'#06b6d4':'#64748b',transition:'left 0.2s',display:'block'}}/>
        </button>
      </div>

      <div style={{marginBottom:'12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
          <Label>Size</Label>
          <span style={{fontSize:'0.65rem',color:'#06b6d4',fontFamily:'"JetBrains Mono",monospace'}}>{sz.toFixed(1)} rem</span>
        </div>
        <input type="range" min={0.9} max={3.5} step={0.05} value={sz}
          onChange={e=>{const v=parseFloat(e.target.value);setSz(v);emitS(v,col,fnt,grad)}}
          style={{width:'100%',accentColor:'#06b6d4'}}/>
      </div>

      <div style={{marginBottom:'12px'}}>
        <Label>Font</Label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px'}}>
          {ROLE_FONT_OPTS.map(f=>(
            <button key={f.value} onClick={()=>{setFnt(f.value);emitS(sz,col,f.value,grad)}}
              style={{padding:'5px 8px',borderRadius:'6px',border:`1px solid ${fnt===f.value?'rgba(6,182,212,0.60)':'rgba(255,255,255,0.07)'}`,background:fnt===f.value?'rgba(6,182,212,0.18)':'rgba(255,255,255,0.02)',color:fnt===f.value?'#f1f5f9':'#94a3b8',cursor:'pointer',fontSize:'0.70rem',fontFamily:f.value,textAlign:'left'}}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!grad && (
        <div>
          <Label>Text Color</Label>
          <SwatchRow values={SWATCHES} value={col} onChange={c=>{setCol(c);emitS(sz,c,fnt,grad)}}/>
        </div>
      )}
    </PanelShell>
  )
}

// ── ANIMATED ROLE ─────────────────────────────────────────────────────────────
function AnimRole({roles,rs,animStyle}:{
  roles:string[]
  rs:{fontSize:string;fontFamily:string;color:string;useGradient:boolean}
  animStyle:'typewriter'|'fade'|'slide'|'bounce'
}) {
  const [idx,setIdx]=useState(0)
  useEffect(()=>{
    if(animStyle==='typewriter') return
    const t=setInterval(()=>setIdx(i=>(i+1)%roles.length),2800)
    return ()=>clearInterval(t)
  },[roles.length,animStyle])

  const tStyle: React.CSSProperties={
    fontFamily:rs.fontFamily,fontWeight:700,fontSize:rs.fontSize,margin:0,display:'block',
    ...(rs.useGradient
      ?{background:'linear-gradient(135deg,#06b6d4,#818cf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}
      :{color:rs.color}),
  }

  if(animStyle==='typewriter') {
    return <TypeAnimation sequence={roles.flatMap(r=>[r,2200]).flat()} wrapper="h2" speed={52} repeat={Infinity} style={tStyle}/>
  }

  const variants={
    fade:  {init:{opacity:0},         anim:{opacity:1},          exit:{opacity:0},          trans:{duration:0.55,ease:'easeInOut'}},
    slide: {init:{opacity:0,y:40},    anim:{opacity:1,y:0},      exit:{opacity:0,y:-40},     trans:{duration:0.45,ease:[0.22,1,0.36,1] as [number,number,number,number]}},
    bounce:{init:{opacity:0,scale:0.55},anim:{opacity:1,scale:1},exit:{opacity:0,scale:0.55},trans:{type:'spring' as const,stiffness:280,damping:20}},
  }[animStyle]

  return (
    <div style={{position:'relative',height:'2.4em',overflow:'hidden'}}>
      <AnimatePresence mode="wait">
        <motion.h2 key={idx}
          initial={variants.init} animate={variants.anim} exit={variants.exit}
          transition={variants.trans}
          style={{...tStyle,position:'absolute',top:0,left:0,width:'100%'}}>
          {roles[idx]}
        </motion.h2>
      </AnimatePresence>
    </div>
  )
}

// ── EDIT BUTTON ───────────────────────────────────────────────────────────────
function EditBtn({label,active,color,onClick}:{label:string;active:boolean;color:string;onClick:()=>void}) {
  return (
    <button onClick={onClick} style={{
      position:'absolute',top:'-16px',right:0,zIndex:10,
      display:'inline-flex',alignItems:'center',gap:'4px',
      padding:'3px 9px',borderRadius:'7px',
      background:active?`rgba(0,0,0,0.6)`:`rgba(0,0,0,0.4)`,
      border:`1px solid ${active?color+'aa':color+'44'}`,
      color,cursor:'pointer',fontSize:'0.60rem',
      fontFamily:'"JetBrains Mono",monospace',letterSpacing:'0.10em',
      textTransform:'uppercase' as const,transition:'all 0.15s',
    }}>
      <Palette size={9}/>{label}
    </button>
  )
}

// ── SOCIAL LINK EDIT ROW ─────────────────────────────────────────────────────
function SocialEditRow({ link, onUpdate, onRemove }: {
  link: SocialLink
  onUpdate: (val: Partial<SocialLink>) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const preset = SOCIAL_PRESETS.find(p => p.type === link.type) ?? SOCIAL_PRESETS[10]
  const Icon = SOCIAL_ICON_MAP[link.type] ?? LinkIcon
  return (
    <div style={{ borderRadius:'10px', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', overflow:'hidden', marginBottom:'6px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px' }}>
        <div style={{ width:28, height:28, borderRadius:'8px', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={14}/>
        </div>
        <span style={{ flex:1, fontSize:'0.75rem', color:'#e2e8f0', fontFamily:'Syne,sans-serif', fontWeight:600 }}>{link.label || preset.label}</span>
        <button onClick={()=>setOpen(o=>!o)} style={{ background:'rgba(99,102,241,0.10)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:'6px', color:'#818cf8', cursor:'pointer', padding:'3px 7px', fontSize:'0.60rem' }}>
          {open ? 'Close' : 'Edit'}
        </button>
        <button onClick={onRemove} style={{ background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)', borderRadius:'6px', color:'#f87171', cursor:'pointer', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Trash2 size={11}/>
        </button>
      </div>
      {open && (
        <div style={{ padding:'0 10px 12px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginTop:'10px', marginBottom:'8px' }}>
            <p style={{ margin:'0 0 5px', fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Icon Type</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px' }}>
              {SOCIAL_PRESETS.map(p => {
                const PI = SOCIAL_ICON_MAP[p.type] ?? LinkIcon
                return (
                  <button key={p.type} onClick={()=>onUpdate({type:p.type as SocialIconType, label:p.label})}
                    style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 6px', borderRadius:'7px', border:`1px solid ${link.type===p.type?'rgba(99,102,241,0.60)':'rgba(255,255,255,0.07)'}`, background:link.type===p.type?'rgba(99,102,241,0.18)':'rgba(255,255,255,0.02)', color:link.type===p.type?'#f1f5f9':'#64748b', cursor:'pointer', fontSize:'0.60rem' }}>
                    <PI size={11}/>{p.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ marginBottom:'7px' }}>
            <p style={{ margin:'0 0 4px', fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Label</p>
            <input value={link.label} onChange={e=>onUpdate({label:e.target.value})}
              style={{ width:'100%', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.22)', borderRadius:'7px', padding:'5px 8px', fontSize:'0.75rem', color:'#e2e8f0', outline:'none', boxSizing:'border-box' }}/>
          </div>
          <div>
            <p style={{ margin:'0 0 4px', fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>URL / href</p>
            <input value={link.href} onChange={e=>onUpdate({href:e.target.value})}
              placeholder={preset.placeholder}
              style={{ width:'100%', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.22)', borderRadius:'7px', padding:'5px 8px', fontSize:'0.70rem', color:'#e2e8f0', outline:'none', boxSizing:'border-box', fontFamily:'"JetBrains Mono",monospace' }}/>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SOCIAL PANEL (draggable) ──────────────────────────────────────────────────
function SocialPanel({ links, style, onAddLink, onUpdateLink, onRemoveLink, onUpdateStyle, onResetStyle, onClose }: {
  links: SocialLink[]
  style: typeof DEFAULT_SOCIAL_STYLE
  onAddLink: () => void
  onUpdateLink: (id: string, val: Partial<SocialLink>) => void
  onRemoveLink: (id: string) => void
  onUpdateStyle: (val: Partial<typeof DEFAULT_SOCIAL_STYLE>) => void
  onResetStyle: () => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'links'|'style'>('links')
  return (
    <PanelShell border="rgba(99,102,241,0.35)" title="Social Links" accentColor="#818cf8" onClose={onClose} initialX={40} initialY={180}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
        {(['links','style'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:'7px', borderRadius:'8px', border:`1px solid ${tab===t?'rgba(99,102,241,0.55)':'rgba(255,255,255,0.07)'}`, background:tab===t?'rgba(99,102,241,0.18)':'transparent', color:tab===t?'#f1f5f9':'#64748b', cursor:'pointer', fontSize:'0.72rem', fontFamily:'Syne,sans-serif', fontWeight:600, textTransform:'capitalize' }}>
            {t === 'links' ? '🔗 Links' : '🎨 Style'}
          </button>
        ))}
      </div>

      {tab === 'links' && (
        <>
          {links.length === 0 && (
            <p style={{ textAlign:'center', color:'#334155', fontSize:'0.75rem', fontFamily:'"JetBrains Mono",monospace', padding:'12px 0' }}>No links yet — add one below</p>
          )}
          {links.map(link => (
            <SocialEditRow key={link.id} link={link}
              onUpdate={val => onUpdateLink(link.id, val)}
              onRemove={() => onRemoveLink(link.id)}/>
          ))}
          <button onClick={onAddLink}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', width:'100%', padding:'8px', borderRadius:'9px', border:'1px dashed rgba(99,102,241,0.40)', background:'rgba(99,102,241,0.07)', color:'#818cf8', cursor:'pointer', fontSize:'0.75rem', fontFamily:'Syne,sans-serif', fontWeight:600, marginTop:'6px' }}>
            <Plus size={13}/> Add Social Link
          </button>
        </>
      )}

      {tab === 'style' && (
        <>
          {/* Size */}
          <div style={{ marginBottom:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
              <p style={{ margin:0, fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Button Size</p>
              <span style={{ fontSize:'0.62rem', color:'#818cf8', fontFamily:'"JetBrains Mono",monospace' }}>{style.size}px</span>
            </div>
            <input type="range" min={32} max={64} step={2} value={style.size}
              onChange={e=>onUpdateStyle({size:parseInt(e.target.value)})} style={{ width:'100%', accentColor:'#6366f1' }}/>
          </div>
          {/* Icon size */}
          <div style={{ marginBottom:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
              <p style={{ margin:0, fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Icon Size</p>
              <span style={{ fontSize:'0.62rem', color:'#818cf8', fontFamily:'"JetBrains Mono",monospace' }}>{style.iconSize}px</span>
            </div>
            <input type="range" min={12} max={28} step={1} value={style.iconSize}
              onChange={e=>onUpdateStyle({iconSize:parseInt(e.target.value)})} style={{ width:'100%', accentColor:'#6366f1' }}/>
          </div>
          {/* Border radius */}
          <div style={{ marginBottom:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
              <p style={{ margin:0, fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Border Radius</p>
              <span style={{ fontSize:'0.62rem', color:'#818cf8', fontFamily:'"JetBrains Mono",monospace' }}>{style.borderRadius}px</span>
            </div>
            <input type="range" min={0} max={50} step={1} value={style.borderRadius}
              onChange={e=>onUpdateStyle({borderRadius:parseInt(e.target.value)})} style={{ width:'100%', accentColor:'#6366f1' }}/>
          </div>
          {/* Gap */}
          <div style={{ marginBottom:'14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
              <p style={{ margin:0, fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Gap</p>
              <span style={{ fontSize:'0.62rem', color:'#818cf8', fontFamily:'"JetBrains Mono",monospace' }}>{style.gap}px</span>
            </div>
            <input type="range" min={4} max={24} step={2} value={style.gap}
              onChange={e=>onUpdateStyle({gap:parseInt(e.target.value)})} style={{ width:'100%', accentColor:'#6366f1' }}/>
          </div>
          <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'0 0 14px' }}/>
          {/* Colors */}
          {[
            { key:'bg',         label:'Background',  val:style.bg         },
            { key:'border',     label:'Border',      val:style.border     },
            { key:'color',      label:'Icon Color',  val:style.color      },
            { key:'hoverColor', label:'Hover Color', val:style.hoverColor },
          ].map(({key,label,val}) => (
            <div key={key} style={{ marginBottom:'10px' }}>
              <p style={{ margin:'0 0 5px', fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>{label}</p>
              <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                <input type="color" value={val.startsWith('#')?val:'#94a3b8'} onChange={e=>onUpdateStyle({[key]:e.target.value})}
                  style={{ width:'28px', height:'28px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', cursor:'pointer', padding:0, flexShrink:0 }}/>
                <input value={val} onChange={e=>onUpdateStyle({[key]:e.target.value})}
                  style={{ flex:1, background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.22)', borderRadius:'7px', padding:'4px 8px', fontSize:'0.65rem', color:'#e2e8f0', outline:'none', fontFamily:'"JetBrains Mono",monospace' }}/>
              </div>
            </div>
          ))}
          {/* Preview */}
          <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'14px 0' }}/>
          <p style={{ margin:'0 0 8px', fontSize:'0.58rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.14em' }}>Preview</p>
          <div style={{ display:'flex', gap:`${style.gap}px`, padding:'10px', background:'rgba(0,0,0,0.3)', borderRadius:'10px' }}>
            {[Github, Linkedin, Mail].map((Icon, i) => (
              <div key={i} style={{ width:`${style.size}px`, height:`${style.size}px`, borderRadius:`${style.borderRadius}px`, background:style.bg, border:`1px solid ${style.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:style.color, flexShrink:0 }}>
                <Icon size={style.iconSize}/>
              </div>
            ))}
          </div>
          {/* Reset */}
          <button onClick={onResetStyle}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', width:'100%', padding:'8px', borderRadius:'9px', border:'1px solid rgba(239,68,68,0.30)', background:'rgba(239,68,68,0.08)', color:'#f87171', cursor:'pointer', fontSize:'0.72rem', marginTop:'14px' }}>
            <RotateCcw size={12}/> Reset to Default Style
          </button>
        </>
      )}
    </PanelShell>
  )
}

// ── MAIN HERO ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const {data,updateHero,addSocialLink,updateSocialLink,removeSocialLink,updateSocialStyle,resetSocialStyle} = usePortfolio()
  const {isEditMode}       = useAdmin()
  useTheme()
  const {hero}             = data
  const ref = useRef<HTMLElement>(null)

  const [showResume,setShowResume] = useState(false)
  const [panel,setPanel]           = useState<'name'|'role'|'badge'|'social'|null>(null)
  const [dotColor,setDotColor]     = useState('#6366f1')

  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']})
  const y       =useTransform(scrollYProgress,[0,1],[0,130])
  const opacity =useTransform(scrollYProgress,[0,0.55],[1,0])

  const resumeUrl = hero.resumeUrl ?? ''
  const nameStyle = hero.nameStyle ?? {fontSize:'clamp(3.2rem,8vw,5.5rem)',fontFamily:'Syne,sans-serif',color:'#f1f5f9'}
  const roleStyle = hero.roleStyle ?? {fontSize:'clamp(1.2rem,3vw,1.65rem)',fontFamily:'Syne,sans-serif',color:'#818cf8',useGradient:true}
  const roleAnim  = (hero.roleAnimStyle as 'typewriter'|'fade'|'slide'|'bounce') ?? 'typewriter'
  const badgeText = hero.badgeText ?? '✦ Available for opportunities'
  const socialLinks = hero.socialLinks ?? []
  const socialStyle = { ...DEFAULT_SOCIAL_STYLE, ...(hero.socialStyle ?? {}) }

  // Use saved fontWeight if available, else derive from font opts
  const nameWeight = (parseInt((nameStyle as {fontSize:string;fontFamily:string;color:string;fontWeight?:string}).fontWeight ?? '0') || NAME_FONT_OPTS.find(f=>f.value===nameStyle.fontFamily)?.weight) ?? 900

  const togglePanel=(p:'name'|'role'|'badge'|'social')=>setPanel(prev=>prev===p?null:p)

  return (
    <section id="hero" ref={ref} style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden',paddingTop:'80px',paddingBottom:'60px'}}>
      <PlanetLabel/>
      <PlanetSelector/>

      <motion.div style={{y,opacity,width:'100%'}}>
        <div style={{maxWidth:'82rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)'}}>
          <div style={{maxWidth:'600px',display:'flex',flexDirection:'column',gap:'24px'}}>

            {/* ── Available badge ───────────────────────────────────────── */}
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.15}}
              style={{position:'relative',alignSelf:'flex-start'}}>

              {isEditMode && <EditBtn label="Edit Text" active={panel==='badge'} color="#34d399" onClick={()=>togglePanel('badge')}/>}

              {isEditMode && panel==='badge' ? (
                <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}}
                  style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(6,12,32,0.99)',border:'1px solid rgba(52,211,153,0.40)',borderRadius:'9999px',padding:'4px 6px 4px 14px'}}>
                  <motion.div animate={{opacity:[1,0.3,1],scale:[1,0.8,1]}} transition={{duration:2,repeat:Infinity}}
                    style={{width:6,height:6,borderRadius:'50%',background:'var(--badge-dot,#34d399)',flexShrink:0}}/>
                  <input autoFocus defaultValue={badgeText}
                    onChange={e=>updateHero({badgeText:e.target.value} as Parameters<typeof updateHero>[0])}
                    onBlur={()=>setPanel(null)}
                    onKeyDown={e=>{if(e.key==='Enter'||e.key==='Escape')setPanel(null)}}
                    style={{background:'transparent',border:'none',outline:'none',color:'var(--badge-text,#34d399)',fontFamily:'"JetBrains Mono",monospace',fontSize:'var(--badge-font-size,0.78rem)',letterSpacing:'0.06em',width:'260px'}}/>
                </motion.div>
              ) : (
                <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 14px',borderRadius:'9999px',background:'var(--badge-bg,rgba(52,211,153,0.08))',border:'1px solid var(--badge-border,rgba(52,211,153,0.22))'}}>
                  <motion.div animate={{opacity:[1,0.3,1],scale:[1,0.8,1]}} transition={{duration:2,repeat:Infinity}}
                    style={{width:6,height:6,borderRadius:'50%',background:'var(--badge-dot,#34d399)',boxShadow:'0 0 8px var(--badge-dot,#34d399)'}}/>
                  <span style={{fontSize:'var(--badge-font-size,0.78rem)',color:'var(--badge-text,#34d399)',fontFamily:'"JetBrains Mono",monospace',letterSpacing:'0.06em'}}>
                    {badgeText}
                  </span>
                </div>
              )}
            </motion.div>

            {/* ── Name ─────────────────────────────────────────────────── */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}}
              style={{position:'relative'}}>

              {isEditMode && <EditBtn label="Style Name" active={panel==='name'} color="#818cf8" onClick={()=>togglePanel('name')}/>}

              <h1 style={{
                fontFamily:nameStyle.fontFamily,
                fontWeight:nameWeight,
                fontSize:nameStyle.fontSize,
                color:nameStyle.color,
                margin:0,lineHeight:0.96,letterSpacing:'-0.02em',
              }}>
                <EditableText value={hero.name} onChange={v=>updateHero({name:v})} as="span"/>
                <span style={{color:dotColor}}>.</span>
              </h1>

              <AnimatePresence>
                {isEditMode && panel==='name' && (
                  <NamePanel ns={nameStyle} dotColor={dotColor}
                    onNsChange={s=>updateHero({nameStyle:s})}
                    onDotChange={setDotColor}
                    onClose={()=>setPanel(null)}/>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Role text ─────────────────────────────────────────────── */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}}
              style={{position:'relative'}}>

              {isEditMode && <EditBtn label="Edit Roles" active={panel==='role'} color="#06b6d4" onClick={()=>togglePanel('role')}/>}

              <AnimRole roles={hero.roles} rs={roleStyle} animStyle={roleAnim}/>

              <AnimatePresence>
                {isEditMode && panel==='role' && (
                  <RolePanel roles={hero.roles} animStyle={roleAnim} rs={roleStyle}
                    onRolesChange={r=>updateHero({roles:r})}
                    onAnimChange={v=>updateHero({roleAnimStyle:v} as Parameters<typeof updateHero>[0])}
                    onRsChange={s=>updateHero({roleStyle:s})}
                    onClose={()=>setPanel(null)}/>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tagline */}
            <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.42}}
              style={{margin:0,color:'#64748b',fontSize:'1.02rem',lineHeight:1.72,maxWidth:'520px'}}>
              <EditableText value={hero.tagline} onChange={v=>updateHero({tagline:v})} as="span" multiline/>
            </motion.p>

            {/* Location */}
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.48}}
              style={{margin:0,display:'flex',alignItems:'center',gap:'6px',color:'#475569',fontSize:'0.88rem',fontFamily:'"JetBrains Mono",monospace'}}>
              <span>📍</span>
              <EditableText value={hero.location} onChange={v=>updateHero({location:v})} as="span"/>
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.64}}
              style={{display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'center'}}>
              <motion.button
                onClick={()=>document.getElementById('projects')?.scrollIntoView({behavior:'smooth'})}
                whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
                style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 28px',borderRadius:'14px',border:'none',cursor:'pointer',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'1rem',fontFamily:'Syne,sans-serif',fontWeight:600,boxShadow:'0 0 32px rgba(99,102,241,0.40)'}}>
                View My Work →
              </motion.button>
              <motion.button
                onClick={()=>{ if(!resumeUrl){alert('No resume URL set yet.\n\nGo to Edit Mode → click "Resume ✎" in the navbar.');return} setShowResume(true) }}
                whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
                style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 22px',borderRadius:'14px',border:'1px solid rgba(99,102,241,0.45)',cursor:'pointer',background:'transparent',color:'#818cf8',fontSize:'1rem',fontFamily:'Syne,sans-serif',fontWeight:600}}>
                <Eye size={16}/> View CV
              </motion.button>
              {resumeUrl && (
                <motion.a href={toDownloadUrl(resumeUrl)} target="_blank" rel="noopener noreferrer"
                  whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
                  style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'12px 16px',borderRadius:'14px',textDecoration:'none',background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.22)',color:'#64748b'}}>
                  <Download size={14}/>
                </motion.a>
              )}
            </motion.div>

            {/* Socials */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.74}}
              style={{position:'relative'}}>

              {isEditMode && (
                <button onClick={()=>togglePanel('social')}
                  style={{position:'absolute',top:'-18px',right:0,zIndex:10,display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 9px',borderRadius:'7px',background:panel==='social'?'rgba(0,0,0,0.6)':'rgba(0,0,0,0.4)',border:`1px solid ${panel==='social'?'#818cf8aa':'#818cf844'}`,color:'#818cf8',cursor:'pointer',fontSize:'0.60rem',fontFamily:'"JetBrains Mono",monospace',letterSpacing:'0.10em',textTransform:'uppercase' as const}}>
                  <Settings2 size={9}/> Social Links
                </button>
              )}

              <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:`${socialStyle.gap}px`,paddingTop:isEditMode?'8px':'0'}}>
                {socialLinks.map((link,i)=>{
                  const Icon=SOCIAL_ICON_MAP[link.type]??LinkIcon
                  const isMail=link.href.startsWith('mailto:')
                  return (
                    <motion.a key={link.id}
                      href={isMail?undefined:link.href}
                      onClick={isMail?(e)=>{e.preventDefault();window.location.href=link.href}:undefined}
                      target={isMail?undefined:'_blank'} rel="noopener noreferrer" aria-label={link.label}
                      initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}}
                      transition={{delay:0.78+i*0.08,type:'spring',stiffness:360}}
                      whileHover={{scale:1.18,y:-3}} whileTap={{scale:0.92}}
                      style={{display:'flex',alignItems:'center',justifyContent:'center',width:`${socialStyle.size}px`,height:`${socialStyle.size}px`,borderRadius:`${socialStyle.borderRadius}px`,background:socialStyle.bg,backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:`1px solid ${socialStyle.border}`,color:socialStyle.color,textDecoration:'none',cursor:'pointer',transition:'color 0.2s,border-color 0.2s,box-shadow 0.2s',flexShrink:0}}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.color=socialStyle.hoverColor;el.style.borderColor='rgba(99,102,241,0.45)';el.style.boxShadow='0 0 20px rgba(99,102,241,0.25)'}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.color=socialStyle.color;el.style.borderColor=socialStyle.border;el.style.boxShadow='none'}}>
                      <Icon size={socialStyle.iconSize}/>
                    </motion.a>
                  )
                })}
                {isEditMode && socialLinks.length===0 && (
                  <button onClick={()=>togglePanel('social')}
                    style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 14px',borderRadius:'10px',border:'1px dashed rgba(99,102,241,0.40)',background:'rgba(99,102,241,0.07)',color:'#818cf8',cursor:'pointer',fontSize:'0.75rem'}}>
                    <Plus size={13}/> Add Social Links
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isEditMode && panel==='social' && (
                  <SocialPanel
                    links={socialLinks}
                    style={socialStyle}
                    onAddLink={addSocialLink}
                    onUpdateLink={updateSocialLink}
                    onRemoveLink={removeSocialLink}
                    onUpdateStyle={updateSocialStyle}
                    onResetStyle={resetSocialStyle}
                    onClose={()=>setPanel(null)}/>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.1}}
        onClick={()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'})}
        style={{position:'absolute',bottom:'32px',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',background:'transparent',border:'none',color:'#475569',cursor:'pointer',fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',letterSpacing:'0.14em',textTransform:'uppercase'}}>
        <span>scroll</span>
        <motion.div animate={{y:[0,6,0]}} transition={{duration:1.7,repeat:Infinity,ease:'easeInOut'}}>
          <ArrowDown size={14}/>
        </motion.div>
      </motion.button>

      {/* Resume modal */}
      {showResume && resumeUrl && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(10px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px'}}
          onClick={e=>{if(e.target===e.currentTarget)setShowResume(false)}}>
          <motion.div initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}}
            style={{width:'100%',maxWidth:'900px',height:'90vh',display:'flex',flexDirection:'column',background:'rgba(8,15,40,0.98)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'20px',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
              <span style={{fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.95rem',color:'#f1f5f9',flex:1}}>{hero.name} — Resume</span>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'9px',background:'rgba(99,102,241,0.15)',color:'#818cf8',fontSize:'0.78rem',textDecoration:'none',border:'1px solid rgba(99,102,241,0.25)'}}>Open in tab</a>
              <a href={toDownloadUrl(resumeUrl)} target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'9px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontSize:'0.78rem',textDecoration:'none'}}>
                <Download size={13}/> Download
              </a>
              <button onClick={()=>setShowResume(false)}
                style={{background:'transparent',border:'none',color:'#64748b',cursor:'pointer',fontSize:'1.1rem',padding:'4px 8px'}}>✕</button>
            </div>
            <div style={{flex:1,overflow:'hidden'}}>
              <iframe src={resumeUrl.includes('drive.google.com')?resumeUrl.replace('/view','/preview'):resumeUrl}
                style={{width:'100%',height:'100%',border:'none'}} title="Resume"/>
            </div>
          </motion.div>
        </motion.div>
      )}


    </section>
  )
}