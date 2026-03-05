'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Github, ExternalLink, Star, Plus, Trash2,
  Upload, X, Image as ImageIcon, Loader2,
  ChevronLeft, ChevronRight, AlertCircle, Tag, Check,
} from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin }      from '@/context/AdminContext'
import { EditableText, EditableTags } from '@/components/admin/EditableText'

const SL: React.CSSProperties = { fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }
const H2: React.CSSProperties = { fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.2rem)',color:'#f1f5f9',margin:0,lineHeight:1.1 }
const GR: React.CSSProperties = { background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }

const ACCENTS = [
  { top:'rgba(99,102,241,0.7)',  glow:'rgba(99,102,241,0.18)' },
  { top:'rgba(6,182,212,0.7)',   glow:'rgba(6,182,212,0.15)'  },
  { top:'rgba(139,92,246,0.7)',  glow:'rgba(139,92,246,0.15)' },
]

const TAG_PRESETS = [
  { label:'Full Stack',       color:'#818cf8', bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.30)' },
  { label:'Backend',          color:'#06b6d4', bg:'rgba(6,182,212,0.10)',   border:'rgba(6,182,212,0.28)'  },
  { label:'Frontend',         color:'#34d399', bg:'rgba(52,211,153,0.10)',  border:'rgba(52,211,153,0.28)' },
  { label:'Personal Project', color:'#f59e0b', bg:'rgba(245,158,11,0.10)',  border:'rgba(245,158,11,0.28)' },
  { label:'Group Project',    color:'#ec4899', bg:'rgba(236,72,153,0.10)',  border:'rgba(236,72,153,0.28)' },
  { label:'Open Source',      color:'#a78bfa', bg:'rgba(167,139,250,0.10)', border:'rgba(167,139,250,0.28)'}
]
function getTagStyle(tag: string) {
  return TAG_PRESETS.find(t => t.label === tag) ?? { label:tag, color:'#94a3b8', bg:'rgba(148,163,184,0.10)', border:'rgba(148,163,184,0.25)' }
}

function TagEditor({ value, onChange, onClose }: { value:string; onChange:(v:string)=>void; onClose:()=>void }) {
  const [custom, setCustom] = useState('')
  return (
    <motion.div
      initial={{ opacity:0,y:-6,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:-6,scale:0.97 }}
      transition={{ duration:0.18,ease:[0.22,1,0.36,1] }}
      style={{ position:'absolute',top:'calc(100% + 8px)',left:0,zIndex:200,background:'rgba(6,12,32,0.99)',border:'1px solid rgba(99,102,241,0.35)',borderRadius:'14px',padding:'14px',width:'220px',boxShadow:'0 24px 60px rgba(0,0,0,0.65)' }}>
      <p style={{ margin:'0 0 10px',fontSize:'0.60rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.18em' }}>Project Tag</p>
      <div style={{ display:'flex',flexDirection:'column',gap:'5px',marginBottom:'10px' }}>
        {TAG_PRESETS.map(t => (
          <button key={t.label} onClick={()=>{ onChange(t.label); onClose() }}
            style={{ display:'flex',alignItems:'center',gap:'8px',padding:'7px 10px',borderRadius:'8px',border:`1px solid ${value===t.label?t.border:'transparent'}`,background:value===t.label?t.bg:'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'left',transition:'all 0.14s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.bg}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=value===t.label?t.bg:'rgba(255,255,255,0.02)'}>
            <span style={{ width:8,height:8,borderRadius:'50%',background:t.color,flexShrink:0,display:'block' }}/>
            <span style={{ fontSize:'0.78rem',fontFamily:'"DM Sans",sans-serif',color:value===t.label?'#f1f5f9':'#94a3b8',fontWeight:value===t.label?600:400 }}>{t.label}</span>
            {value===t.label && <Check size={11} color="#34d399" style={{ marginLeft:'auto' }}/>}
          </button>
        ))}
      </div>
      <div style={{ display:'flex',gap:'6px' }}>
        <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Custom tag…"
          onKeyDown={e=>{ if(e.key==='Enter'&&custom.trim()){ onChange(custom.trim()); onClose() }}}
          style={{ flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(99,102,241,0.28)',borderRadius:'7px',padding:'5px 9px',fontSize:'0.73rem',color:'#e2e8f0',outline:'none',fontFamily:'"JetBrains Mono",monospace' }}/>
        <button onClick={()=>{ if(custom.trim()){ onChange(custom.trim()); onClose() }}}
          style={{ padding:'5px 10px',borderRadius:'7px',background:'rgba(99,102,241,0.20)',border:'1px solid rgba(99,102,241,0.40)',color:'#818cf8',cursor:'pointer',fontSize:'0.73rem',fontFamily:'"JetBrains Mono",monospace' }}>Set</button>
      </div>
    </motion.div>
  )
}

function ImageSlider({ images, cardHovered, imageHovered }: { images:string[]; cardHovered:boolean; imageHovered:boolean }) {
  const [idx, setIdx]   = useState(0)
  const touchStart      = useRef(0)
  const intervalRef     = useRef<ReturnType<typeof setInterval>|null>(null)

  useEffect(() => { setIdx(0) }, [images.length])

  // Auto-slide: active when card is hovered BUT not when cursor is over the image itself
  useEffect(() => {
    const shouldSlide = cardHovered && !imageHovered && images.length > 1
    if (shouldSlide) {
      intervalRef.current = setInterval(() => setIdx(i => (i+1) % images.length), 1400)
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [cardHovered, imageHovered, images.length])

  if (images.length === 0) return (
    <div style={{ width:'100%',paddingTop:'56.25%',position:'relative',borderRadius:'12px',overflow:'hidden',background:'rgba(99,102,241,0.05)',border:'1px dashed rgba(99,102,241,0.20)',marginBottom:'18px' }}>
      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',color:'#334155' }}>
        <ImageIcon size={28} strokeWidth={1.2}/><span style={{ fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace' }}>No images yet</span>
      </div>
    </div>
  )

  const prev = (e:React.MouseEvent) => { e.stopPropagation(); setIdx(i=>(i-1+images.length)%images.length) }
  const next = (e:React.MouseEvent) => { e.stopPropagation(); setIdx(i=>(i+1)%images.length) }
  const onTouchStart = (e:React.TouchEvent) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e:React.TouchEvent) => {
    const d = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(d)>40) d>0 ? setIdx(i=>(i+1)%images.length) : setIdx(i=>(i-1+images.length)%images.length)
  }

  return (
    <div style={{ marginBottom:'18px',userSelect:'none' }}>
      <div
        style={{ position:'relative',width:'100%',paddingTop:'56.25%',borderRadius:'12px',overflow:'hidden',background:'rgba(8,15,40,0.8)',cursor:images.length>1?'grab':'default' }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img key={idx} src={images[idx]} alt={`img ${idx+1}`}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.30 }}
            style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block' }}
            onError={e=>{(e.currentTarget as HTMLImageElement).style.opacity='0.2'}}/>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            {/* Invisible click zone — left 40% */}
            <button onClick={prev} aria-label="Previous image"
              style={{ position:'absolute',left:0,top:0,width:'40%',height:'100%',background:'transparent',border:'none',cursor:'pointer',zIndex:3 }}>
              <span style={{ position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',opacity:cardHovered?0.50:0,transition:'opacity 0.35s',pointerEvents:'none',display:'flex',alignItems:'center',justifyContent:'center',width:'28px',height:'28px',borderRadius:'50%',background:'rgba(4,8,26,0.55)',backdropFilter:'blur(4px)' }}>
                <ChevronLeft size={14} color="#f1f5f9"/>
              </span>
            </button>
            {/* Invisible click zone — right 40% */}
            <button onClick={next} aria-label="Next image"
              style={{ position:'absolute',right:0,top:0,width:'40%',height:'100%',background:'transparent',border:'none',cursor:'pointer',zIndex:3 }}>
              <span style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',opacity:cardHovered?0.50:0,transition:'opacity 0.35s',pointerEvents:'none',display:'flex',alignItems:'center',justifyContent:'center',width:'28px',height:'28px',borderRadius:'50%',background:'rgba(4,8,26,0.55)',backdropFilter:'blur(4px)' }}>
                <ChevronRight size={14} color="#f1f5f9"/>
              </span>
            </button>
            {/* Counter — only on hover */}
            <div style={{ position:'absolute',top:'8px',right:'8px',background:'rgba(4,8,26,0.65)',backdropFilter:'blur(6px)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:'20px',padding:'3px 9px',fontSize:'0.63rem',fontFamily:'"JetBrains Mono",monospace',color:'#94a3b8',zIndex:4,opacity:cardHovered?1:0,transition:'opacity 0.3s' }}>
              {idx+1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display:'flex',justifyContent:'center',gap:'5px',marginTop:'8px' }}>
          {images.map((_,i) => (
            <button key={i} onClick={()=>setIdx(i)}
              style={{ width:i===idx?'18px':'5px',height:'5px',borderRadius:'3px',background:i===idx?'#818cf8':'rgba(99,102,241,0.25)',border:'none',cursor:'pointer',padding:0,transition:'all 0.28s ease' }}/>
          ))}
        </div>
      )}
    </div>
  )
}

function ImageManager({ projectId, images, onUpdate }: { projectId:string; images:string[]; onUpdate:(imgs:string[])=>void }) {
  const [uploading,setUploading] = useState(false)
  const [uploadErr,setUploadErr] = useState<string|null>(null)
  const [deleting, setDeleting]  = useState<string|null>(null)
  const [dragOver, setDragOver]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(async (files:FileList|null) => {
    if (!files||files.length===0) return
    setUploading(true); setUploadErr(null)
    const newUrls:string[]=[]; const errors:string[]=[]
    try {
      const { getSupabaseConfig,getSupabaseClient } = await import('@/lib/supabaseClient')
      const { valid } = getSupabaseConfig()
      if (!valid) { setUploadErr('Supabase not configured.'); setUploading(false); return }
      const client = getSupabaseClient()
      for (const file of Array.from(files)) {
        const ext  = (file.name.split('.').pop()??'jpg').toLowerCase()
        const path = `projects/${projectId}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`
        const { data:upData,error:upErr } = await client.storage.from('project-images').upload(path,file,{ cacheControl:'3600',upsert:true,contentType:file.type||'image/jpeg' })
        if (upErr) { errors.push(`${file.name}: ${upErr.message}`); continue }
        const { data:pub } = client.storage.from('project-images').getPublicUrl(upData?.path??path)
        if (pub?.publicUrl) newUrls.push(pub.publicUrl)
        else errors.push(`${file.name}: no public URL`)
      }
    } catch (err:any) { setUploadErr(`Upload failed: ${err?.message??err}`) }
    setUploading(false)
    if (errors.length>0) setUploadErr(`${errors.length} failed:\n${errors.join('\n')}`)
    if (newUrls.length>0) onUpdate([...images,...newUrls])
    if (fileRef.current) fileRef.current.value=''
  }, [images,projectId,onUpdate])

  const deleteImage = useCallback(async (url:string) => {
    setDeleting(url)
    try {
      const { getSupabaseConfig,getSupabaseClient } = await import('@/lib/supabaseClient')
      const { valid } = getSupabaseConfig()
      if (valid) {
        const client=getSupabaseClient()
        const m=url.match(/project-images\/(.+?)(?:\?|$)/)
        if (m?.[1]) await client.storage.from('project-images').remove([decodeURIComponent(m[1])])
      }
    } catch {}
    setDeleting(null); onUpdate(images.filter(u=>u!==url))
  }, [images,onUpdate])

  return (
    <div style={{ marginBottom:'16px' }}>
      <p style={{ margin:'0 0 8px',fontSize:'0.67rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.14em' }}>Project Images</p>
      {images.length>0 && (
        <div style={{ display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'10px' }}>
          {images.map((url,i)=>(
            <div key={url} style={{ position:'relative',width:'68px',height:'50px',borderRadius:'7px',overflow:'hidden',border:'1px solid rgba(99,102,241,0.30)',flexShrink:0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`img-${i}`} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.opacity='0.3'}}/>
              <button onClick={()=>deleteImage(url)} disabled={deleting===url}
                style={{ position:'absolute',top:'2px',right:'2px',width:'18px',height:'18px',borderRadius:'4px',background:'rgba(239,68,68,0.88)',border:'none',color:'#fff',cursor:deleting===url?'wait':'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0 }}>
                {deleting===url?<Loader2 size={9} style={{ animation:'spin 1s linear infinite' }}/>:<X size={9}/>}
              </button>
            </div>
          ))}
        </div>
      )}
      <div role="button" tabIndex={0}
        onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)}
        onDrop={e=>{e.preventDefault();setDragOver(false);uploadFiles(e.dataTransfer.files)}}
        onClick={()=>!uploading&&fileRef.current?.click()}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')fileRef.current?.click()}}
        style={{ border:`2px dashed ${dragOver?'rgba(99,102,241,0.70)':'rgba(99,102,241,0.30)'}`,borderRadius:'10px',padding:'14px 12px',cursor:uploading?'wait':'pointer',background:dragOver?'rgba(99,102,241,0.08)':'rgba(99,102,241,0.03)',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px' }}>
        {uploading?(<><Loader2 size={14} color="#818cf8" style={{ animation:'spin 1s linear infinite' }}/><span style={{ fontSize:'0.73rem',color:'#818cf8',fontFamily:'"JetBrains Mono",monospace' }}>Uploading…</span></>)
          :(<><Upload size={14} color="#64748b"/><span style={{ fontSize:'0.73rem',color:'#64748b',fontFamily:'"JetBrains Mono",monospace' }}>{images.length>0?'Add more images':'Click or drop images'}</span></>)}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e=>uploadFiles(e.target.files)}/>
      {uploadErr&&(
        <div style={{ marginTop:'8px',padding:'8px 10px',borderRadius:'8px',background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.30)',display:'flex',gap:'8px',alignItems:'flex-start' }}>
          <AlertCircle size={13} color="#f87171" style={{ flexShrink:0,marginTop:'1px' }}/>
          <pre style={{ margin:0,fontSize:'0.70rem',color:'#fca5a5',fontFamily:'"JetBrains Mono",monospace',whiteSpace:'pre-wrap',wordBreak:'break-word' }}>{uploadErr}</pre>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project,index,inView }: { project:any;index:number;inView:boolean }) {
  const { updateProject,removeProject } = usePortfolio()
  const { isAdmin,isEditMode } = useAdmin()
  const [hovered,       setHovered]       = useState(false)
  const [imageHovered,  setImageHovered]  = useState(false)
  const [showTagEditor, setShowTagEditor] = useState(false)

  const update = (field:string,val:any) => updateProject(project.id,{ [field]:val })
  const accent   = ACCENTS[index % ACCENTS.length]
  const images   = (project.images ?? []) as string[]
  const tag      = project.projectTag ?? 'Full Stack'
  const tagStyle = getTagStyle(tag)

  return (
    <motion.div
      initial={{ opacity:0,y:48,scale:0.97 }} animate={inView?{ opacity:1,y:0,scale:1 }:{}}
      transition={{ duration:0.60,delay:index*0.12,ease:[0.22,1,0.36,1] }}
      style={{ position:'relative',height:'100%' }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>{ setHovered(false); setShowTagEditor(false) }}>
      <div style={{
        position:'relative',height:'100%',background:'rgba(8,15,40,0.72)',backdropFilter:'blur(22px)',WebkitBackdropFilter:'blur(22px)',
        border:`1px solid ${hovered?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.07)'}`,borderRadius:'18px',
        display:'flex',flexDirection:'column',overflow:'hidden',
        boxShadow:hovered?`0 16px 48px ${accent.glow}`:'none',transition:'border-color 0.3s,box-shadow 0.3s',
      }}>
        <div style={{ position:'absolute',top:0,left:'20%',right:'20%',height:'1px',background:`linear-gradient(90deg,transparent,${accent.top},transparent)`,borderRadius:'99px',zIndex:1,pointerEvents:'none' }}/>

        {isAdmin && isEditMode ? (
          <div style={{ padding:'22px',display:'flex',flexDirection:'column',gap:'12px',flex:1 }}>
            <div style={{ display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap' }}>
              {project.featured && (
                <span style={{ display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'9999px',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.22)',color:'#fbbf24',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace' }}>
                  <Star size={8} fill="currentColor"/> Featured
                </span>
              )}
              <div style={{ position:'relative' }}>
                <button onClick={()=>setShowTagEditor(p=>!p)}
                  style={{ display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 10px',borderRadius:'9999px',background:tagStyle.bg,border:`1px solid ${tagStyle.border}`,color:tagStyle.color,fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',cursor:'pointer',transition:'all 0.15s' }}>
                  <Tag size={8}/> {tag}
                </button>
                <AnimatePresence>
                  {showTagEditor && <TagEditor value={tag} onChange={v=>update('projectTag',v)} onClose={()=>setShowTagEditor(false)}/>}
                </AnimatePresence>
              </div>
              <button onClick={()=>removeProject(project.id)}
                style={{ marginLeft:'auto',padding:'5px 10px',borderRadius:'7px',background:'rgba(239,68,68,0.14)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace' }}>
                <Trash2 size={12}/> Delete
              </button>
            </div>
            <ImageManager projectId={project.id} images={images} onUpdate={imgs=>update('images',imgs)}/>
            <h3 style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.08rem',color:'#f1f5f9',margin:0 }}>
              <EditableText value={project.title} onChange={v=>update('title',v)} as="span"/>
            </h3>
            <p style={{ color:'#64748b',fontSize:'0.86rem',lineHeight:1.65,margin:0,flex:1 }}>
              <EditableText value={project.description} onChange={v=>update('description',v)} as="span" multiline/>
            </p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'6px' }}>
              {project.tech.map((t:string)=>(<span key={t} style={{ padding:'3px 10px',borderRadius:'6px',fontSize:'0.71rem',fontFamily:'"JetBrains Mono",monospace',background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.18)',color:'#a5b4fc' }}>{t}</span>))}
            </div>
            <EditableTags tags={project.tech} onChange={v=>update('tech',v)}/>
            <div style={{ display:'flex',gap:'8px',flexWrap:'wrap',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.05)' }}>
              <input defaultValue={project.github} onBlur={e=>update('github',e.target.value)} placeholder="GitHub URL"
                style={{ flex:1,minWidth:'130px',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.28)',borderRadius:'7px',padding:'6px 10px',fontSize:'0.72rem',color:'#94a3b8',outline:'none' }}/>
              <input defaultValue={project.live} onBlur={e=>update('live',e.target.value)} placeholder="Live URL"
                style={{ flex:1,minWidth:'110px',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.28)',borderRadius:'7px',padding:'6px 10px',fontSize:'0.72rem',color:'#94a3b8',outline:'none' }}/>
            </div>
          </div>
        ) : (
          <div style={{ padding:'22px',display:'flex',flexDirection:'column',gap:0,flex:1 }}>
            <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px',flexWrap:'wrap' }}>
              {project.featured && (
                <motion.div animate={{ boxShadow:['0 0 0px rgba(251,191,36,0)','0 0 14px rgba(251,191,36,0.40)','0 0 0px rgba(251,191,36,0)'] }} transition={{ duration:2.2,repeat:Infinity }}
                  style={{ display:'inline-flex',alignItems:'center',gap:'5px',padding:'4px 10px',borderRadius:'9999px',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.22)',color:'#fbbf24',fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace' }}>
                  <Star size={9} fill="currentColor"/> Featured
                </motion.div>
              )}
              <span style={{ display:'inline-flex',alignItems:'center',gap:'5px',padding:'4px 10px',borderRadius:'9999px',background:tagStyle.bg,border:`1px solid ${tagStyle.border}`,color:tagStyle.color,fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace' }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:tagStyle.color,flexShrink:0,display:'block' }}/>
                {tag}
              </span>
            </div>
            <div
              onMouseEnter={() => setImageHovered(true)}
              onMouseLeave={() => setImageHovered(false)}
            >
              <ImageSlider images={images} cardHovered={hovered} imageHovered={imageHovered}/>
            </div>
            <h3 style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.18rem',color:'#f1f5f9',margin:'0 0 10px' }}>{project.title}</h3>
            <p style={{ color:'#64748b',fontSize:'0.87rem',lineHeight:1.72,margin:'0 0 16px',flex:1 }}>{project.description}</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'18px' }}>
              {project.tech.map((t:string)=>(<span key={t} style={{ padding:'3px 10px',borderRadius:'6px',fontSize:'0.71rem',fontFamily:'"JetBrains Mono",monospace',background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.18)',color:'#a5b4fc' }}>{t}</span>))}
            </div>
            <div style={{ display:'flex',gap:'10px',flexWrap:'wrap',marginTop:'auto',paddingTop:'16px',borderTop:'1px solid rgba(255,255,255,0.05)' }}>
              {project.github&&(<a href={project.github} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex',alignItems:'center',gap:'7px',padding:'8px 16px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',fontSize:'0.82rem',color:'#cbd5e1',textDecoration:'none',fontFamily:'Syne,sans-serif',fontWeight:500,transition:'border-color 0.2s,color 0.2s' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(99,102,241,0.50)';el.style.color='#fff'}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.09)';el.style.color='#cbd5e1'}}>
                <Github size={15}/> Code</a>)}
              {project.live&&(<a href={project.live} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex',alignItems:'center',gap:'7px',padding:'8px 16px',borderRadius:'8px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.30)',fontSize:'0.82rem',color:'#818cf8',textDecoration:'none',fontFamily:'Syne,sans-serif',fontWeight:500,transition:'border-color 0.2s,background 0.2s' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(99,102,241,0.22)';el.style.borderColor='rgba(99,102,241,0.55)'}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(99,102,241,0.12)';el.style.borderColor='rgba(99,102,241,0.30)'}}>
                <ExternalLink size={15}/> Live</a>)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const [ref,inView] = useInView({ triggerOnce:true,threshold:0.05 })
  const { data,addProject } = usePortfolio()
  const { isAdmin,isEditMode } = useAdmin()
  return (
    <section ref={ref} style={{ padding:'7rem 0',position:'relative' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>
        <motion.div initial={{ opacity:0,y:36 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.65,ease:[0.22,1,0.36,1] }} style={{ textAlign:'center',marginBottom:'4rem' }}>
          <span style={SL}>03 \u2014 Projects</span>
          <h2 style={H2}>Things I&apos;ve <span style={GR}>Built</span></h2>
          <motion.p initial={{ opacity:0,y:14 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.5,delay:0.14 }}
            style={{ color:'#64748b',marginTop:'12px',maxWidth:'36rem',margin:'12px auto 0',fontSize:'0.97rem',lineHeight:1.65 }}>
            A selection of projects demonstrating my full-stack engineering capabilities.
          </motion.p>
        </motion.div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,22rem),1fr))',gap:'24px',alignItems:'start' }}>
          <AnimatePresence>
            {data.projects.map((project,i)=>(<ProjectCard key={project.id} project={project} index={i} inView={inView}/>))}
          </AnimatePresence>
          {isAdmin&&isEditMode&&(
            <motion.button onClick={addProject} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              style={{ background:'rgba(8,15,40,0.55)',backdropFilter:'blur(16px)',border:'2px dashed rgba(99,102,241,0.28)',borderRadius:'18px',padding:'28px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'12px',color:'#475569',cursor:'pointer',minHeight:'280px',transition:'all 0.2s',width:'100%' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(99,102,241,0.60)';el.style.color='#818cf8'}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(99,102,241,0.28)';el.style.color='#475569'}}>
              <Plus size={30}/><span style={{ fontFamily:'Syne,sans-serif',fontWeight:500,fontSize:'0.95rem' }}>Add Project</span>
            </motion.button>
          )}
        </div>
        <motion.div initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:0.7 }} style={{ textAlign:'center',marginTop:'3.5rem' }}>
          <a href="https://github.com/Rutikyadav71" target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:'8px',color:'#475569',fontSize:'0.9rem',fontFamily:'Syne,sans-serif',textDecoration:'none',transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#f1f5f9'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#475569'}>
            <Github size={17}/> See more on GitHub \u2192
          </a>
        </motion.div>
      </div>
    </section>
  )
}