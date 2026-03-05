'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Code2, Rocket, Target, MapPin, GraduationCap, User,
  Globe, Plus, Trash2, Camera, Loader2, Upload, Check, X,
  Square, Circle,
} from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin }      from '@/context/AdminContext'
import { EditableText }  from '@/components/admin/EditableText'

const SL: React.CSSProperties   = { fontFamily:'"JetBrains Mono",monospace',fontSize:'0.70rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }
const H2: React.CSSProperties   = { fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.2rem)',color:'#f1f5f9',margin:0,lineHeight:1.1 }
const GRAD: React.CSSProperties = { background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }
const CARD: React.CSSProperties = { background:'rgba(8,15,40,0.65)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',padding:'18px 22px' }

const spring = (delay=0) => ({ duration:0.70,delay,ease:[0.22,1,0.36,1] as [number,number,number,number] })
const UP     = { hidden:{ opacity:0,y:36  }, visible:{ opacity:1,y:0  } }
const LEFT   = { hidden:{ opacity:0,x:-40 }, visible:{ opacity:1,x:0  } }
const RIGHT  = { hidden:{ opacity:0,x: 40 }, visible:{ opacity:1,x:0  } }

const HIGHLIGHT_META = [
  { key:'spec'       as const, icon:Code2,         label:'Specialisation', color:'#6366f1', bg:'rgba(99,102,241,0.12)' },
  { key:'frontend'   as const, icon:Rocket,        label:'Frontend',       color:'#06b6d4', bg:'rgba(6,182,212,0.10)'  },
  { key:'goalLabel'  as const, icon:Target,        label:'Career Goal',    color:'#8b5cf6', bg:'rgba(139,92,246,0.10)' },
  { key:'graduating' as const, icon:GraduationCap, label:'Graduating',     color:'#f59e0b', bg:'rgba(245,158,11,0.10)' },
]

// ── Frame/shape presets ───────────────────────────────────────────────────────
type FrameShape = 'portrait' | 'square' | 'circle' | 'wide'
type FrameStyle = 'gradient' | 'indigo' | 'cyan' | 'gold' | 'none'

interface FrameConfig { shape: FrameShape; style: FrameStyle; size: number }

const SHAPE_OPTS: { id: FrameShape; label: string; aspect: string; radius: string }[] = [
  { id:'portrait', label:'Portrait', aspect:'3/4',    radius:'20px' },
  { id:'square',   label:'Square',   aspect:'1/1',    radius:'20px' },
  { id:'circle',   label:'Circle',   aspect:'1/1',    radius:'50%'  },
  { id:'wide',     label:'Wide',     aspect:'4/3',    radius:'20px' },
]
const STYLE_OPTS: { id: FrameStyle; label: string; gradient: string }[] = [
  { id:'gradient', label:'Gradient', gradient:'linear-gradient(135deg,rgba(99,102,241,0.70),rgba(6,182,212,0.60),rgba(139,92,246,0.65))' },
  { id:'indigo',   label:'Indigo',   gradient:'linear-gradient(135deg,rgba(99,102,241,0.80),rgba(99,102,241,0.40))' },
  { id:'cyan',     label:'Cyan',     gradient:'linear-gradient(135deg,rgba(6,182,212,0.80),rgba(6,182,212,0.40))'   },
  { id:'gold',     label:'Gold',     gradient:'linear-gradient(135deg,rgba(245,158,11,0.80),rgba(251,191,36,0.40))' },
  { id:'none',     label:'None',     gradient:'transparent' },
]

// ── Photo Editor Modal ────────────────────────────────────────────────────────
function PhotoEditorModal({
  currentSrc, frame, onSave, onClose,
}: {
  currentSrc: string
  frame:      FrameConfig
  onSave:     (src: string, frame: FrameConfig) => void
  onClose:    () => void
}) {
  const [previewSrc, setPreviewSrc] = useState(currentSrc)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [cfg, setCfg] = useState<FrameConfig>({ ...frame })
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const shape = SHAPE_OPTS.find(s => s.id === cfg.shape) ?? SHAPE_OPTS[0]
  const style = STYLE_OPTS.find(s => s.id === cfg.style) ?? STYLE_OPTS[0]

  const onFileChange = (file: File | null | undefined) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewSrc(url)
    setPendingFile(file)
    setUploadErr(null)
  }

  const handleSave = async () => {
    if (!pendingFile) {
      // No new file — just save frame changes
      onSave(currentSrc, cfg)
      return
    }

    setUploading(true)
    setUploadErr(null)
    try {
      const { getSupabaseConfig, getSupabaseClient } = await import('@/lib/supabaseClient')
      const { valid } = getSupabaseConfig()
      if (!valid) {
        setUploadErr('Supabase not configured. Add keys to .env.local and restart.')
        setUploading(false); return
      }
      const client = getSupabaseClient()
      const ext  = (pendingFile.name.split('.').pop() ?? 'jpg').toLowerCase()
      const path = `avatar/profile_${Date.now()}.${ext}`
      const { data: upData, error: upErr } = await client.storage
        .from('profile-images')
        .upload(path, pendingFile, { cacheControl:'3600', upsert:true, contentType: pendingFile.type || 'image/jpeg' })
      if (upErr) { setUploadErr(upErr.message); setUploading(false); return }
      const { data: pub } = client.storage.from('profile-images').getPublicUrl(upData?.path ?? path)
      if (!pub?.publicUrl) { setUploadErr('Got no public URL'); setUploading(false); return }
      onSave(pub.publicUrl, cfg)
    } catch (err: unknown) {
      setUploadErr(err instanceof Error ? err.message : 'Upload failed')
    }
    setUploading(false)
  }

  return (
    <div
      style={{ position:'fixed',inset:0,zIndex:99999,background:'rgba(2,8,23,0.92)',backdropFilter:'blur(18px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity:0, scale:0.93, y:20 }}
        animate={{ opacity:1, scale:1,    y:0  }}
        transition={{ duration:0.28, ease:[0.22,1,0.36,1] }}
        style={{ width:'100%',maxWidth:'780px',background:'rgba(8,15,40,0.98)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'22px',overflow:'hidden',display:'flex',flexDirection:'column' }}
      >
        {/* Modal header */}
        <div style={{ display:'flex',alignItems:'center',padding:'18px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <Camera size={18} color="#818cf8" style={{ marginRight:'10px' }}/>
          <span style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:'#f1f5f9',flex:1 }}>
            Edit Profile Photo
          </span>
          <button onClick={onClose}
            style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'8px',color:'#64748b',cursor:'pointer',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <X size={16}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ display:'flex',gap:0,flex:1,minHeight:0 }}>

          {/* Left: live preview */}
          <div style={{ flex:'0 0 300px',padding:'28px 24px',display:'flex',flexDirection:'column',alignItems:'center',gap:'20px',borderRight:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ margin:0,fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.16em',alignSelf:'flex-start' }}>
              Live Preview
            </p>

            {/* Photo preview */}
            <div style={{ position:'relative',width:`${cfg.size}px`,height:`${cfg.size * (shape.aspect==='3/4'? 4/3 : shape.aspect==='4/3'? 3/4 : 1)}px`,maxWidth:'220px',maxHeight:'300px' }}>
              {/* Frame glow */}
              <div style={{ position:'absolute',inset:'-3px',borderRadius:shape.radius,background:style.gradient,zIndex:0,filter:'blur(1px)' }}/>
              {/* Photo container */}
              <div style={{ position:'relative',zIndex:1,borderRadius:shape.radius,overflow:'hidden',width:'100%',height:'100%',border:'var(--frame-thickness-val, 2px) solid var(--frame-border, rgba(99,102,241,0.25))',background:'var(--frame-bg, rgba(8,15,40,0.8))' }}>
                {previewSrc ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewSrc} alt="Preview"
                      style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center',display:'block' }}/>
                  </>
                ) : (
                  <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <User size={48} color="rgba(99,102,241,0.35)" strokeWidth={1.2}/>
                  </div>
                )}
              </div>
              {/* Corner accents (hidden for circle) */}
              {shape.id !== 'circle' && (
                <>
                  <div style={{ position:'absolute',top:'-6px',left:'-6px',width:16,height:16,borderTop:'2px solid #6366f1',borderLeft:'2px solid #6366f1',borderRadius:'3px 0 0 0',zIndex:2 }}/>
                  <div style={{ position:'absolute',top:'-6px',right:'-6px',width:16,height:16,borderTop:'2px solid #06b6d4',borderRight:'2px solid #06b6d4',borderRadius:'0 3px 0 0',zIndex:2 }}/>
                  <div style={{ position:'absolute',bottom:'-6px',left:'-6px',width:16,height:16,borderBottom:'2px solid #8b5cf6',borderLeft:'2px solid #8b5cf6',borderRadius:'0 0 0 3px',zIndex:2 }}/>
                  <div style={{ position:'absolute',bottom:'-6px',right:'-6px',width:16,height:16,borderBottom:'2px solid #06b6d4',borderRight:'2px solid #06b6d4',borderRadius:'0 0 3px 0',zIndex:2 }}/>
                </>
              )}
            </div>

            {/* Choose photo button */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{ display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'10px',background:'rgba(99,102,241,0.14)',border:'1px dashed rgba(99,102,241,0.45)',color:'#818cf8',fontSize:'0.80rem',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:500,width:'100%',justifyContent:'center',transition:'all 0.2s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.24)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.14)'}>
              <Upload size={14}/> Choose Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={e => onFileChange(e.target.files?.[0])}/>

            {pendingFile && (
              <p style={{ margin:0,fontSize:'0.68rem',color:'#34d399',fontFamily:'"JetBrains Mono",monospace',textAlign:'center' }}>
                ✓ {pendingFile.name}
              </p>
            )}
          </div>

          {/* Right: controls */}
          <div style={{ flex:1,padding:'28px 24px',display:'flex',flexDirection:'column',gap:'24px',overflowY:'auto' }}>

            {/* Shape */}
            <div>
              <p style={{ margin:'0 0 12px',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.18em' }}>Shape</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px' }}>
                {SHAPE_OPTS.map(s => (
                  <button key={s.id} onClick={() => setCfg(c => ({ ...c, shape: s.id }))}
                    style={{ padding:'10px 6px',borderRadius:'10px',border:`1px solid ${cfg.shape===s.id?'rgba(99,102,241,0.70)':'rgba(255,255,255,0.08)'}`,background:cfg.shape===s.id?'rgba(99,102,241,0.18)':'rgba(255,255,255,0.03)',color:cfg.shape===s.id?'#818cf8':'#64748b',cursor:'pointer',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',transition:'all 0.18s' }}>
                    {s.id==='circle' && <Circle size={18}/>}
                    {s.id==='square' && <Square size={18}/>}
                    {s.id==='portrait' && <div style={{ width:14,height:18,border:`2px solid currentColor`,borderRadius:'3px' }}/>}
                    {s.id==='wide' && <div style={{ width:18,height:14,border:`2px solid currentColor`,borderRadius:'3px' }}/>}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame style */}
            <div>
              <p style={{ margin:'0 0 12px',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.18em' }}>Frame Color</p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:'8px' }}>
                {STYLE_OPTS.map(s => (
                  <button key={s.id} onClick={() => setCfg(c => ({ ...c, style: s.id }))}
                    style={{ padding:'8px 14px',borderRadius:'8px',border:`1px solid ${cfg.style===s.id?'rgba(99,102,241,0.70)':'rgba(255,255,255,0.08)'}`,background:cfg.style===s.id?'rgba(99,102,241,0.18)':'rgba(255,255,255,0.03)',color:cfg.style===s.id?'#f1f5f9':'#64748b',cursor:'pointer',fontSize:'0.75rem',fontFamily:'"JetBrains Mono",monospace',display:'flex',alignItems:'center',gap:'7px',transition:'all 0.18s' }}>
                    <div style={{ width:12,height:12,borderRadius:'3px',background:s.id==='none'?'rgba(255,255,255,0.10)':s.gradient,flexShrink:0 }}/>
                    {s.label}
                    {cfg.style===s.id && <Check size={11} color="#34d399"/>}
                  </button>
                ))}
              </div>
            </div>

            {/* Size slider */}
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'10px' }}>
                <p style={{ margin:0,fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.18em' }}>Display Size</p>
                <span style={{ fontSize:'0.75rem',color:'#818cf8',fontFamily:'"JetBrains Mono",monospace' }}>{cfg.size}px</span>
              </div>
              <input type="range" min={120} max={320} step={4}
                value={cfg.size}
                onChange={e => setCfg(c => ({ ...c, size: Number(e.target.value) }))}
                style={{ width:'100%',accentColor:'#6366f1' }}
              />
              <div style={{ display:'flex',justifyContent:'space-between',marginTop:'4px' }}>
                <span style={{ fontSize:'0.60rem',color:'#334155',fontFamily:'"JetBrains Mono",monospace' }}>Small</span>
                <span style={{ fontSize:'0.60rem',color:'#334155',fontFamily:'"JetBrains Mono",monospace' }}>Large</span>
              </div>
            </div>

            {/* Error */}
            {uploadErr && (
              <div style={{ padding:'10px 14px',borderRadius:'10px',background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.30)',fontSize:'0.72rem',color:'#fca5a5',fontFamily:'"JetBrains Mono",monospace',wordBreak:'break-word' }}>
                {uploadErr}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex',justifyContent:'flex-end',gap:'10px',padding:'16px 24px',borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onClose}
            style={{ padding:'10px 20px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#64748b',cursor:'pointer',fontSize:'0.85rem',fontFamily:'Syne,sans-serif',fontWeight:500 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={uploading}
            style={{ padding:'10px 24px',borderRadius:'10px',background:uploading?'rgba(99,102,241,0.30)':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'#fff',cursor:uploading?'wait':'pointer',fontSize:'0.85rem',fontFamily:'Syne,sans-serif',fontWeight:600,display:'flex',alignItems:'center',gap:'8px',minWidth:'130px',justifyContent:'center' }}>
            {uploading
              ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Uploading…</>
              : <><Upload size={14}/> {pendingFile ? 'Upload & Save' : 'Save Changes'}</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main About component ──────────────────────────────────────────────────────
export default function About() {
  const [ref, inView] = useInView({ triggerOnce:true, threshold:0.08 })
  const { data, updateAbout, addLanguage, updateLanguage, removeLanguage } = usePortfolio()
  const { isEditMode } = useAdmin()
  const { about } = data

  const [showPhotoEditor, setShowPhotoEditor] = useState(false)

  // Frame config — sourced from context (persisted in Supabase + localStorage)
  const frameConfig: FrameConfig = (about as unknown as { frameConfig?: FrameConfig }).frameConfig ?? { shape:'portrait', style:'gradient', size:220 }

  const langs   = about.languages ?? []
  const hl      = about.highlights ?? { spec:'Java, SQL',frontend:'React',goalLabel:'Software Dev',graduating:'2026 \u2014 CSE' }
  const bios    = [about.bio1,about.bio2,about.bio3,about.bio4].filter((b,i) => i < 3 || !!b)
  const avatarSrc = about.avatarUrl || '/rutik.jpg'

  const shapeInfo = SHAPE_OPTS.find(s => s.id === frameConfig.shape) ?? SHAPE_OPTS[0]
  const styleInfo = STYLE_OPTS.find(s => s.id === frameConfig.style) ?? STYLE_OPTS[0]

  // Aspect ratio for container
  const aspectMap: Record<FrameShape, string> = {
    portrait: '3/4', square: '1/1', circle: '1/1', wide: '4/3',
  }

  const handlePhotoSave = (avatarSrc: string, cfg: FrameConfig) => {
    updateAbout({ avatarUrl: avatarSrc, frameConfig: cfg } as Parameters<typeof updateAbout>[0])
    setShowPhotoEditor(false)
  }

  return (
    <section ref={ref} style={{ padding:'7rem 0',position:'relative' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {showPhotoEditor && (
        <PhotoEditorModal
          currentSrc={avatarSrc}
          frame={frameConfig}
          onSave={handlePhotoSave}
          onClose={() => setShowPhotoEditor(false)}
        />
      )}

      <div style={{ maxWidth:'82rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>

        {/* Section header */}
        <motion.div variants={UP} initial="hidden" animate={inView?'visible':'hidden'} transition={spring(0)}
          style={{ textAlign:'center',marginBottom:'4.5rem' }}>
          <span style={SL}>01 - About Me</span>
          <h2 style={H2}>Who I <span style={GRAD}>Am</span></h2>
        </motion.div>

        {/* Main grid */}
        <div className="about-grid">

          {/* LEFT \u2014 Photo + info */}
          <motion.div variants={LEFT} initial="hidden" animate={inView?'visible':'hidden'} transition={spring(0.10)}
            style={{ display:'flex',flexDirection:'column',gap:'16px' }}>

            {/* Photo frame */}
            <motion.div
              whileHover={{ scale:1.02 }} transition={{ duration:0.35 }}
              style={{ position:'relative', width:'fit-content' }}
            >
              {/* Gradient border glow */}
              <div style={{ position:'absolute',inset:'-3px',borderRadius:shapeInfo.radius,background:styleInfo.gradient !== 'transparent' ? styleInfo.gradient : 'var(--frame-glow, linear-gradient(135deg,rgba(99,102,241,0.70),rgba(6,182,212,0.60),rgba(139,92,246,0.65)))',zIndex:0,filter:'blur(1px)' }}/>

              {/* Photo container — shape-controlled */}
              <div style={{
                position:'relative',zIndex:1,
                borderRadius: shapeInfo.radius,
                overflow:'hidden',
                width: `${frameConfig.size}px`,
                aspectRatio: aspectMap[frameConfig.shape],
                background:'var(--frame-bg, rgba(8,15,40,0.8))',
                border:'var(--frame-thickness, 2px) solid var(--frame-border, rgba(99,102,241,0.25))',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarSrc}
                  alt="Rutik Yadav"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }}
                  style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center',display:'block' }}
                />
                <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(6,182,212,0.10))',zIndex:-1 }}>
                  <User size={72} color="rgba(99,102,241,0.35)" strokeWidth={1.2}/>
                </div>

                {/* Edit mode camera button */}
                {isEditMode && (
                  <button
                    onClick={() => setShowPhotoEditor(true)}
                    style={{ position:'absolute',inset:0,background:'rgba(4,8,26,0.55)',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',zIndex:3,transition:'opacity 0.2s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(4,8,26,0.75)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(4,8,26,0.55)'}>
                    <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(99,102,241,0.22)',border:'1px solid rgba(99,102,241,0.55)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <Camera size={22} color="#818cf8"/>
                    </div>
                    <span style={{ fontSize:'0.70rem',color:'#a5b4fc',fontFamily:'"JetBrains Mono",monospace',lineHeight:1.4 }}>Edit Photo</span>
                  </button>
                )}

                {/* Open to work badge */}
                <div style={{ position:'absolute',bottom:'12px',left:'50%',transform:'translateX(-50%)',display:'inline-flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'9999px',background:'rgba(4,20,40,0.88)',border:'1px solid rgba(52,211,153,0.45)',backdropFilter:'blur(10px)',whiteSpace:'nowrap',zIndex:4 }}>
                  <motion.div animate={{ opacity:[1,0.3,1],scale:[1,0.8,1] }} transition={{ duration:2,repeat:Infinity }}
                    style={{ width:7,height:7,borderRadius:'50%',background:'#34d399',boxShadow:'0 0 6px #34d399' }}/>
                  <span style={{ fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',color:'#34d399',letterSpacing:'0.06em' }}>Open to Work</span>
                </div>
              </div>

              {/* Corner accents (skip for circle) */}
              {shapeInfo.id !== 'circle' && (
                <>
                  <div style={{ position:'absolute',top:'-6px',left:'-6px',width:20,height:20,borderTop:'2px solid #6366f1',borderLeft:'2px solid #6366f1',borderRadius:'4px 0 0 0',zIndex:2 }}/>
                  <div style={{ position:'absolute',top:'-6px',right:'-6px',width:20,height:20,borderTop:'2px solid #06b6d4',borderRight:'2px solid #06b6d4',borderRadius:'0 4px 0 0',zIndex:2 }}/>
                  <div style={{ position:'absolute',bottom:'-6px',left:'-6px',width:20,height:20,borderBottom:'2px solid #8b5cf6',borderLeft:'2px solid #8b5cf6',borderRadius:'0 0 0 4px',zIndex:2 }}/>
                  <div style={{ position:'absolute',bottom:'-6px',right:'-6px',width:20,height:20,borderBottom:'2px solid #06b6d4',borderRight:'2px solid #06b6d4',borderRadius:'0 0 4px 0',zIndex:2 }}/>
                </>
              )}
            </motion.div>

            {/* Quick info */}
            <motion.div variants={UP} initial="hidden" animate={inView?'visible':'hidden'} transition={spring(0.25)}
              style={{ ...CARD,display:'flex',flexDirection:'column',gap:'10px' }}>
              {[{ icon:MapPin,text:'Pune, Maharashtra, IN' },{ icon:GraduationCap,text:'Computer Engineering \u2022 2026' }].map(({ icon:Icon,text }) => (
                <div key={text} style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                  <div style={{ width:32,height:32,borderRadius:'8px',background:'rgba(99,102,241,0.10)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <Icon size={14} color="#818cf8"/>
                  </div>
                  <span style={{ fontSize:'0.82rem',color:'#94a3b8',fontFamily:'"DM Sans",sans-serif' }}>{text}</span>
                </div>
              ))}

              {/* CGPA \u2014 editable in edit mode */}
              <div style={{ marginTop:'4px',paddingTop:'12px',borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px' }}>
                  <span style={{ fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.18em' }}>CGPA</span>
                  {isEditMode ? (
                    <input
                      type="number" min="0" max="10" step="0.01"
                      value={about.cgpa}
                      onChange={e => { const v=parseFloat(e.target.value); if(!isNaN(v)&&v>=0&&v<=10) updateAbout({ cgpa:v }) }}
                      style={{ width:'72px',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.45)',borderRadius:'8px',padding:'4px 8px',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.2rem',color:'#818cf8',outline:'none',textAlign:'right' }}
                    />
                  ) : (
                    <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.5rem',background:'linear-gradient(135deg,#6366f1,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
                      {about.cgpa}
                    </span>
                  )}
                </div>
                <div style={{ height:5,background:'rgba(255,255,255,0.06)',borderRadius:'99px',overflow:'hidden' }}>
                  <motion.div
                    initial={{ width:0 }}
                    animate={inView?{ width:`${Math.min(about.cgpa*10,100)}%` }:{}}
                    transition={{ duration:1.6,delay:0.6,ease:[0.22,1,0.36,1] }}
                    style={{ height:'100%',background:'linear-gradient(90deg,#6366f1,#06b6d4)',borderRadius:'99px' }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT \u2014 Bio + cards */}
          <motion.div variants={RIGHT} initial="hidden" animate={inView?'visible':'hidden'} transition={spring(0.15)}
            style={{ display:'flex',flexDirection:'column',gap:'20px' }}>

            {/* Bio paragraphs */}
            <div style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
              {bios.map((bio, i) => (
                <motion.p key={i} variants={UP} initial="hidden" animate={inView?'visible':'hidden'}
                  transition={spring(0.20+i*0.10)}
                  style={{ margin:0,color:i===0?'#cbd5e1':'#94a3b8',lineHeight:1.78,fontSize:i===0?'1.02rem':'0.95rem' }}>
                  <EditableText value={bio} onChange={v=>updateAbout({ [`bio${i+1}` as 'bio1'|'bio2'|'bio3'|'bio4']:v })} as="span" multiline/>
                </motion.p>
              ))}
              {isEditMode && !about.bio4 && (
                <button onClick={()=>updateAbout({ bio4:'Add your fourth paragraph here...' })}
                  style={{ alignSelf:'flex-start',display:'flex',alignItems:'center',gap:'6px',background:'rgba(99,102,241,0.10)',border:'1px dashed rgba(99,102,241,0.35)',borderRadius:'10px',padding:'7px 14px',color:'#818cf8',fontSize:'0.75rem',cursor:'pointer',fontFamily:'"JetBrains Mono",monospace' }}>
                  <Plus size={13}/> Add paragraph
                </button>
              )}
              {isEditMode && !!about.bio4 && (
                <button onClick={()=>updateAbout({ bio4:'' })}
                  style={{ alignSelf:'flex-start',display:'flex',alignItems:'center',gap:'6px',background:'rgba(239,68,68,0.08)',border:'1px dashed rgba(239,68,68,0.30)',borderRadius:'10px',padding:'7px 14px',color:'#ef4444',fontSize:'0.75rem',cursor:'pointer',fontFamily:'"JetBrains Mono",monospace' }}>
                  <Trash2 size={13}/> Remove paragraph
                </button>
              )}
            </div>

            {/* Career goal card */}
            <motion.div variants={UP} initial="hidden" animate={inView?'visible':'hidden'} transition={spring(0.48)}
              style={{ ...CARD,border:'1px solid rgba(139,92,246,0.25)',background:'rgba(139,92,246,0.06)',position:'relative',overflow:'hidden' }}>
              <motion.div animate={{ x:['-100%','200%'] }} transition={{ duration:2.8,repeat:Infinity,repeatDelay:3.5 }}
                style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.09),transparent)',pointerEvents:'none' }}/>
              <p style={{ margin:'0 0 6px',color:'#a78bfa',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',textTransform:'uppercase',letterSpacing:'0.22em' }}>Career Goal</p>
              <p style={{ margin:0,color:'#cbd5e1',fontSize:'0.95rem',lineHeight:1.70 }}>
                <EditableText value={about.goal} onChange={v=>updateAbout({ goal:v })} as="span" multiline/>
              </p>
            </motion.div>

            {/* Highlight cards */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'12px' }}>
              {HIGHLIGHT_META.map(({ key,icon:Icon,label,color,bg },i) => (
                <motion.div key={label} variants={UP} initial="hidden" animate={inView?'visible':'hidden'}
                  transition={spring(0.55+i*0.08)} whileHover={{ y:-4,transition:{ duration:0.2 } }}>
                  <div style={{ ...CARD,display:'flex',alignItems:'center',gap:'14px',cursor:'default' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${color}55`}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'}}>
                    <motion.div whileHover={{ rotate:360,scale:1.12 }} transition={{ duration:0.55 }}
                      style={{ width:40,height:40,borderRadius:'10px',background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <Icon size={18} color={color}/>
                    </motion.div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ margin:0,color:'#475569',fontSize:'0.60rem',fontFamily:'"JetBrains Mono",monospace',textTransform:'uppercase',letterSpacing:'0.16em' }}>{label}</p>
                      {isEditMode ? (
                        <input value={hl[key]} onChange={e=>updateAbout({ highlights:{ ...hl,[key]:e.target.value } })}
                          style={{ background:'transparent',border:'none',borderBottom:`1px solid ${color}55`,color:'#f1f5f9',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.88rem',padding:'2px 0',outline:'none',width:'100%',marginTop:'3px' }}/>
                      ) : (
                        <p style={{ margin:'3px 0 0',color:'#f1f5f9',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.92rem' }}>{hl[key]}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Languages bar */}
            <motion.div variants={UP} initial="hidden" animate={inView?'visible':'hidden'} transition={spring(0.05)}
              style={{ ...CARD,marginBottom:'2.5rem',display:'flex',flexWrap:'wrap',alignItems:'center',gap:'10px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'8px',marginRight:'4px' }}>
                <Globe size={13} color="#06b6d4"/>
                <span style={{ fontFamily:'"JetBrains Mono",monospace',fontSize:'0.65rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#06b6d4' }}>Languages</span>
              </div>
              {langs.map((lang,i) => (
                <div key={lang.id} style={{ display:'flex',alignItems:'center',gap:'6px' }}>
                  {i > 0 && <span style={{ color:'rgba(255,255,255,0.18)',fontSize:'0.9rem' }}>|</span>}
                  {isEditMode ? (
                    <span style={{ display:'flex',alignItems:'center',gap:'5px' }}>
                      <input value={lang.name} onChange={e=>updateLanguage(lang.id,{name:e.target.value})}
                        style={{ background:'rgba(255,255,255,0.06)',border:'1px solid rgba(99,102,241,0.35)',borderRadius:'6px',padding:'2px 7px',color:'#e2e8f0',fontSize:'0.82rem',fontFamily:'"DM Sans",sans-serif',width:'88px',outline:'none' }}/>
                      <span style={{ color:'#475569',fontSize:'0.75rem' }}>(</span>
                      <input value={lang.level} onChange={e=>updateLanguage(lang.id,{level:e.target.value})}
                        style={{ background:'rgba(255,255,255,0.06)',border:'1px solid rgba(99,102,241,0.35)',borderRadius:'6px',padding:'2px 7px',color:'#94a3b8',fontSize:'0.78rem',fontFamily:'"DM Sans",sans-serif',width:'78px',outline:'none' }}/>
                      <span style={{ color:'#475569',fontSize:'0.75rem' }}>)</span>
                      <button onClick={()=>removeLanguage(lang.id)}
                        style={{ background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:'2px',lineHeight:1 }}>
                        <Trash2 size={12}/>
                      </button>
                    </span>
                  ) : (
                    <span style={{ display:'flex',alignItems:'center',gap:'4px' }}>
                      <span style={{ color:'#e2e8f0',fontSize:'0.88rem',fontFamily:'"DM Sans",sans-serif',fontWeight:500 }}>{lang.name}</span>
                      <span style={{ color:'#64748b',fontSize:'0.80rem',fontFamily:'"DM Sans",sans-serif' }}>({lang.level})</span>
                    </span>
                  )}
                </div>
              ))}
              {isEditMode && (
                <button onClick={addLanguage}
                  style={{ display:'flex',alignItems:'center',gap:'4px',background:'rgba(99,102,241,0.12)',border:'1px dashed rgba(99,102,241,0.40)',borderRadius:'8px',padding:'4px 10px',color:'#818cf8',fontSize:'0.72rem',cursor:'pointer',fontFamily:'"JetBrains Mono",monospace' }}>
                  <Plus size={11}/> Add
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}