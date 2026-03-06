'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, Edit3, Save, X, Code2, Eye, EyeOff } from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin }     from '@/context/AdminContext'

// ── Platform icon SVGs ────────────────────────────────────────────────────────
const PLATFORM_ICONS: Record<string, { svg: string; color: string; bg: string }> = {
  leetcode: {
    color: '#FFA116',
    bg: 'rgba(255,161,22,0.10)',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>`,
  },
  gfg: {
    color: '#2F8D46',
    bg: 'rgba(47,141,70,0.10)',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-2.17.284 4.226 4.226 0 0 1-1.96-.8 4.42 4.42 0 0 1-.994-1.025h-.004c-.26.4-.585.754-.965 1.038a4.178 4.178 0 0 1-1.952.78 4.512 4.512 0 0 1-2.168-.29 3.68 3.68 0 0 1-1.1-.694 3.578 3.578 0 0 1-.562-.745c-1.09.14-2.03-.24-2.37-1.05-.44-1.02.13-2.3 1.46-3.05a5.993 5.993 0 0 1-.3-1.885c0-3.31 2.69-5.99 6-5.99s6 2.68 6 5.99a5.9 5.9 0 0 1-.3 1.882c1.33.752 1.905 2.031 1.464 3.052-.336.806-1.268 1.186-2.35 1.052zm-9.41-.97a2.77 2.77 0 0 0 1.903.695 2.77 2.77 0 0 0 1.903-.695c.498-.46.743-1.077.697-1.745H10.34c-.046.668.2 1.285.698 1.745zm-3.25-4.41a.735.735 0 1 0 1.47 0 .735.735 0 0 0-1.47 0zm6.51 0a.735.735 0 1 0 1.47 0 .735.735 0 0 0-1.47 0z"/></svg>`,
  },
  hackerrank: {
    color: '#00EA64',
    bg: 'rgba(0,234,100,0.08)',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 11.885 0 13-.642 1.114-9.107 6-10.392 6-1.284 0-9.75-4.886-10.392-6C.963 17.885.963 7.115 1.608 6 2.25 4.886 10.715 0 12 0zm2.295 6.799c-.141 0-.258.115-.258.258v3.875H9.963V7.057c0-.143-.115-.258-.258-.258h-1.9c-.141 0-.257.115-.257.258v9.886c0 .143.116.258.258.258h1.9c.141 0 .258-.115.258-.258v-3.875h4.074v3.875c0 .143.115.258.257.258h1.9c.143 0 .258-.115.258-.258V7.057c0-.143-.115-.258-.257-.258h-1.9z"/></svg>`,
  },
  codechef: {
    color: '#5B4638',
    bg: 'rgba(91,70,56,0.15)',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.257.004C5.979.136 1.527 4.741 1.527 10.217c0 2.175.688 4.191 1.86 5.843L.303 21.995l5.748-1.951a8.695 8.695 0 0 0 5.206 1.724c5.357 0 9.695-4.461 9.695-9.561S16.614.004 11.257.004zm-4.57 8.3c.23-.89.798-1.432 1.49-1.432.48 0 .895.234 1.226.702l-1.032.787c-.152-.248-.292-.37-.444-.37-.276 0-.47.254-.594.777-.124.523-.086.89.106.89.173 0 .33-.13.49-.391l.997.719c-.394.614-.877.945-1.468.945-1.018 0-1.494-.89-1.249-1.937l.478.31zm4.68 5.474a2.08 2.08 0 0 1-1.47.618 2.08 2.08 0 0 1-1.47-.618l-1.01-1.008.67-.667 1.01 1.008a1.1 1.1 0 0 0 .8.33 1.1 1.1 0 0 0 .8-.33l1.01-1.008.67.667-1.01 1.008zm2.2-3.537c-.394.614-.877.945-1.468.945-1.018 0-1.494-.89-1.249-1.937.23-.89.798-1.432 1.49-1.432.48 0 .895.234 1.226.702l-1.032.787c-.152-.248-.292-.37-.444-.37-.276 0-.47.254-.594.777-.124.523-.086.89.106.89.173 0 .33-.13.49-.391l.997.719-.522-.69z"/></svg>`,
  },
  codeforces: {
    color: '#1F8ACB',
    bg: 'rgba(31,138,203,0.10)',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-9c0-.828.672-1.5 1.5-1.5h3z"/></svg>`,
  },
  github: {
    color: '#e2e8f0',
    bg: 'rgba(226,232,240,0.08)',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
  },
  link: {
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.10)',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  },
}

const PLATFORM_PRESETS = [
  { id:'leetcode',   label:'LeetCode',      iconType:'leetcode',   placeholder:'https://leetcode.com/your-username' },
  { id:'gfg',        label:'GeeksForGeeks', iconType:'gfg',        placeholder:'https://geeksforgeeks.org/user/your-username' },
  { id:'hackerrank', label:'HackerRank',    iconType:'hackerrank', placeholder:'https://hackerrank.com/your-username' },
  { id:'codeforces', label:'Codeforces',    iconType:'codeforces', placeholder:'https://codeforces.com/profile/your-username' },
  { id:'codechef',   label:'CodeChef',      iconType:'codechef',   placeholder:'https://codechef.com/users/your-username' },
  { id:'github',     label:'GitHub',        iconType:'github',     placeholder:'https://github.com/your-username' },
  { id:'custom',     label:'Custom Link',   iconType:'link',       placeholder:'https://your-link.com' },
]

function PlatformIcon({ iconType, size=28 }: { iconType:string; size?:number }) {
  const info = PLATFORM_ICONS[iconType] ?? PLATFORM_ICONS.link
  return (
    <div style={{ width:size, height:size, color:info.color }}
      dangerouslySetInnerHTML={{ __html: info.svg }}/>
  )
}

// ── Link card (view) ──────────────────────────────────────────────────────────
function LinkCard({ link, onEdit, onDelete, isEditMode }: {
  link: { id:string; platform:string; url:string; username:string; iconType:string }
  onEdit: ()=>void; onDelete: ()=>void; isEditMode: boolean
}) {
  const info = PLATFORM_ICONS[link.iconType] ?? PLATFORM_ICONS.link
  return (
    <motion.div
      whileHover={{ y:-4, boxShadow:`0 16px 48px ${info.bg}` }}
      style={{ position:'relative', borderRadius:'16px', background:'var(--card-bg,rgba(8,15,40,0.72))', border:`1px solid var(--card-border,rgba(255,255,255,0.07))`, backdropFilter:'blur(var(--card-blur,20px))', padding:'20px 22px', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', transition:'border-color 0.25s' }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor = `${info.color}44`}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border,rgba(255,255,255,0.07))'}>

      {isEditMode && (
        <div style={{ position:'absolute', top:'8px', right:'8px', display:'flex', gap:'4px' }}>
          <button onClick={onEdit}
            style={{ width:'26px',height:'26px',borderRadius:'7px',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.30)',color:'#818cf8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Edit3 size={11}/>
          </button>
          <button onClick={onDelete}
            style={{ width:'26px',height:'26px',borderRadius:'7px',background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Trash2 size={11}/>
          </button>
        </div>
      )}

      {/* Icon circle */}
      <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:info.bg, border:`1px solid ${info.color}33`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <PlatformIcon iconType={link.iconType} size={30}/>
      </div>

      <div style={{ textAlign:'center' }}>
        <p style={{ margin:'0 0 2px', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.90rem', color:'#f1f5f9' }}>{link.platform}</p>
        <p style={{ margin:0, fontSize:'0.72rem', color:'#64748b', fontFamily:'"JetBrains Mono",monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'130px' }}>@{link.username || 'username'}</p>
      </div>

      <a href={link.url} target="_blank" rel="noopener noreferrer"
        style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 14px', borderRadius:'9999px', background:`${info.color}14`, border:`1px solid ${info.color}33`, color:info.color, fontSize:'0.72rem', fontFamily:'Syne,sans-serif', fontWeight:600, textDecoration:'none', transition:'all 0.2s' }}
        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=`${info.color}28`}
        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=`${info.color}14`}>
        <ExternalLink size={11}/> Visit
      </a>
    </motion.div>
  )
}

// ── Edit form modal ───────────────────────────────────────────────────────────
function EditLinkModal({ link, onSave, onClose }: {
  link: { id:string; platform:string; url:string; username:string; iconType:string } | null
  onSave: (data:{platform:string;url:string;username:string;iconType:string})=>void
  onClose: ()=>void
}) {
  const isNew = !link
  const [platform,  setPlatform]  = useState(link?.platform  ?? '')
  const [url,       setUrl]       = useState(link?.url       ?? '')
  const [username,  setUsername]  = useState(link?.username  ?? '')
  const [iconType,  setIconType]  = useState(link?.iconType  ?? 'link')

  const applyPreset = (p: typeof PLATFORM_PRESETS[0]) => {
    setPlatform(p.label); setIconType(p.id)
    setUrl(p.placeholder)
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}
      style={{ position:'fixed',inset:0,zIndex:99999,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
      <motion.div initial={{scale:0.92,y:24}} animate={{scale:1,y:0}} exit={{scale:0.92,y:24}}
        style={{ width:'100%',maxWidth:'480px',background:'rgba(5,10,28,0.98)',border:'1px solid rgba(99,102,241,0.30)',borderRadius:'22px',padding:'28px',boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
          <h3 style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.05rem',color:'#f1f5f9' }}>
            {isNew ? 'Add Coding Profile' : 'Edit Link'}
          </h3>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',color:'#64748b',cursor:'pointer',width:'30px',height:'30px',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <X size={14}/>
          </button>
        </div>

        {/* Presets */}
        {isNew && (
          <div style={{ marginBottom:'18px' }}>
            <p style={{ margin:'0 0 8px',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#475569',textTransform:'uppercase',letterSpacing:'0.12em' }}>Quick select platform</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'6px' }}>
              {PLATFORM_PRESETS.map(p=>{
                const info = PLATFORM_ICONS[p.id] ?? PLATFORM_ICONS.link
                return (
                  <button key={p.id} onClick={()=>applyPreset(p)}
                    style={{ display:'flex',alignItems:'center',gap:'6px',padding:'6px 10px',borderRadius:'8px',border:`1px solid ${iconType===p.id?info.color+'66':'rgba(255,255,255,0.08)'}`,background:iconType===p.id?info.bg:'rgba(255,255,255,0.02)',color:iconType===p.id?info.color:'#64748b',cursor:'pointer',fontSize:'0.72rem' }}>
                    <div style={{ width:14,height:14,color:info.color }} dangerouslySetInnerHTML={{__html:info.svg}}/>
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
          <div>
            <label style={{ display:'block',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'5px' }}>Platform Name</label>
            <input value={platform} onChange={e=>setPlatform(e.target.value)} placeholder="e.g. LeetCode"
              style={{ width:'100%',boxSizing:'border-box',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'10px',padding:'10px 12px',color:'#f1f5f9',fontSize:'0.88rem',outline:'none' }}/>
          </div>
          <div>
            <label style={{ display:'block',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'5px' }}>Profile URL</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://leetcode.com/your-username"
              style={{ width:'100%',boxSizing:'border-box',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'10px',padding:'10px 12px',color:'#f1f5f9',fontSize:'0.88rem',outline:'none' }}/>
          </div>
          <div>
            <label style={{ display:'block',fontSize:'0.65rem',fontFamily:'"JetBrains Mono",monospace',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'5px' }}>Username (shown on card)</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="your-username"
              style={{ width:'100%',boxSizing:'border-box',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'10px',padding:'10px 12px',color:'#f1f5f9',fontSize:'0.88rem',outline:'none' }}/>
          </div>
        </div>

        <div style={{ display:'flex',gap:'10px',marginTop:'20px' }}>
          <button onClick={onClose}
            style={{ flex:1,padding:'11px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:'#64748b',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:500 }}>
            Cancel
          </button>
          <button onClick={()=>{ if(!platform||!url) return; onSave({platform,url,username,iconType}); onClose() }}
            style={{ flex:2,display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',padding:'11px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.92rem' }}>
            <Save size={15}/> {isNew ? 'Add Link' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main CodingLinks section ──────────────────────────────────────────────────
export default function CodingLinks() {
  const { data, updateLinksSection, updateCodingLink, removeCodingLink } = usePortfolio()
  const { isEditMode } = useAdmin()
  const { linksSection } = data
  const [editingLink, setEditingLink] = useState<string|null>(null)  // link id or 'new'
  const [showModal, setShowModal]     = useState(false)

  // Don't render at all if hidden and not in edit mode
  if (!linksSection?.enabled && !isEditMode) return null

  const handleSaveLink = (linkData: { platform:string; url:string; username:string; iconType:string }) => {
    if (editingLink === 'new') {
      // addCodingLink adds a placeholder with a Date.now() id; we need to store linkData
      // instead, directly call updateLinksSection with the new link appended
      const existing = data.linksSection?.links ?? []
      const newLink = { id: Date.now().toString(), ...linkData }
      updateLinksSection({ links: [...existing, newLink] })
    } else if (editingLink) {
      updateCodingLink(editingLink, linkData)
    }
    setEditingLink(null)
    setShowModal(false)
  }

  // When section is hidden but admin is in edit mode, show a "enable" placeholder
  if (!linksSection?.enabled && isEditMode) {
    return (
      <section style={{ maxWidth:'80rem',margin:'0 auto',padding:'4rem clamp(1rem,4vw,2.5rem)' }}>
        <motion.div
          initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          style={{ border:'2px dashed rgba(99,102,241,0.30)',borderRadius:'18px',padding:'32px',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px',background:'rgba(99,102,241,0.03)' }}>
          <Code2 size={32} color="#475569"/>
          <p style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'1rem',color:'#475569' }}>Coding Profiles Section (hidden)</p>
          <p style={{ margin:0,fontSize:'0.80rem',color:'#334155',fontFamily:'"JetBrains Mono",monospace' }}>Enable it to show your LeetCode, GFG & other profiles</p>
          <button onClick={()=>updateLinksSection({enabled:true})}
            style={{ display:'flex',alignItems:'center',gap:'6px',padding:'10px 22px',borderRadius:'10px',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.40)',color:'#818cf8',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.88rem' }}>
            <Eye size={14}/> Enable Section
          </button>
        </motion.div>
      </section>
    )
  }

  const links = linksSection?.links ?? []
  const title    = linksSection?.title    ?? 'My Coding Profiles'
  const subtitle = linksSection?.subtitle ?? 'DSA practice, competitive programming & problem solving'

  return (
    <section style={{ padding:'6rem 0',position:'relative' }}>
      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>

        {/* Header */}
        <motion.div
          initial={{opacity:0,y:32}} animate={{opacity:1,y:0}}
          transition={{duration:0.6,ease:[0.22,1,0.36,1]}}
          style={{ textAlign:'center',marginBottom:'3rem' }}>
          <span style={{ fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }}>
            — Profiles
          </span>
          {isEditMode ? (
            <input value={title} onChange={e=>updateLinksSection({title:e.target.value})}
              style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,4vw,2.8rem)',color:'#f1f5f9',background:'transparent',border:'none',outline:'none',borderBottom:'2px dashed rgba(99,102,241,0.40)',textAlign:'center',width:'100%',maxWidth:'600px' }}/>
          ) : (
            <h2 style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,4vw,2.8rem)',color:'#f1f5f9',margin:0 }}>{title}</h2>
          )}
          {isEditMode ? (
            <input value={subtitle} onChange={e=>updateLinksSection({subtitle:e.target.value})}
              style={{ color:'#64748b',fontSize:'0.97rem',background:'transparent',border:'none',outline:'none',borderBottom:'1px dashed rgba(99,102,241,0.25)',textAlign:'center',width:'100%',maxWidth:'500px',marginTop:'10px' }}/>
          ) : (
            <p style={{ color:'#64748b',marginTop:'10px',maxWidth:'500px',margin:'10px auto 0',lineHeight:1.65,fontSize:'0.97rem' }}>{subtitle}</p>
          )}
        </motion.div>

        {/* Edit mode controls */}
        {isEditMode && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{ display:'flex',justifyContent:'center',gap:'10px',marginBottom:'24px',flexWrap:'wrap' }}>
            <button onClick={()=>{setEditingLink('new');setShowModal(true)}}
              style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',borderRadius:'10px',background:'rgba(6,182,212,0.12)',border:'1px solid rgba(6,182,212,0.35)',color:'#06b6d4',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.82rem' }}>
              <Plus size={14}/> Add Profile
            </button>
            <button onClick={()=>updateLinksSection({enabled:false})}
              style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',borderRadius:'10px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.28)',color:'#f87171',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.82rem' }}>
              <EyeOff size={14}/> Hide Section
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {links.length === 0 && isEditMode ? (
          <div style={{ textAlign:'center',padding:'32px',color:'#334155',fontFamily:'"JetBrains Mono",monospace',fontSize:'0.82rem' }}>
            No profiles yet — click &quot;Add Profile&quot; above
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'18px' }}>
            {links.map((link, i) => (
              <motion.div key={link.id}
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                transition={{delay:i*0.06,duration:0.4,ease:[0.22,1,0.36,1]}}>
                <LinkCard
                  link={link}
                  isEditMode={isEditMode}
                  onEdit={()=>{ setEditingLink(link.id); setShowModal(true) }}
                  onDelete={()=>removeCodingLink(link.id)}/>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {showModal && (
          <EditLinkModal
            link={editingLink === 'new' ? null : links.find(l=>l.id===editingLink)||null}
            onSave={handleSaveLink}
            onClose={()=>{ setShowModal(false); setEditingLink(null) }}/>
        )}
      </AnimatePresence>
    </section>
  )
}