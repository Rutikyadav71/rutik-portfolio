'use client'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Award, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin }     from '@/context/AdminContext'
import { EditableText } from '@/components/admin/EditableText'

const SL: React.CSSProperties = { fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }
const H2: React.CSSProperties = { fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.2rem)',color:'#f1f5f9',margin:0,lineHeight:1.1 }
const GR: React.CSSProperties = { background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }

const CERT_COLORS = [
  { border:'rgba(99,102,241,0.30)',  iconBg:'rgba(99,102,241,0.14)', iconColor:'#818cf8', glow:'rgba(99,102,241,0.14)' },
  { border:'rgba(6,182,212,0.25)',   iconBg:'rgba(6,182,212,0.12)',  iconColor:'#22d3ee', glow:'rgba(6,182,212,0.12)'  },
  { border:'rgba(139,92,246,0.25)',  iconBg:'rgba(139,92,246,0.12)', iconColor:'#a78bfa', glow:'rgba(139,92,246,0.12)' },
  { border:'rgba(245,158,11,0.25)',  iconBg:'rgba(245,158,11,0.12)', iconColor:'#fbbf24', glow:'rgba(245,158,11,0.12)' },
  { border:'rgba(52,211,153,0.25)',  iconBg:'rgba(52,211,153,0.12)', iconColor:'#34d399', glow:'rgba(52,211,153,0.12)' },
  { border:'rgba(239,68,68,0.25)',   iconBg:'rgba(239,68,68,0.12)',  iconColor:'#f87171', glow:'rgba(239,68,68,0.12)'  },
]

export default function Certificates() {
  const [ref, inView] = useInView({ triggerOnce:true,threshold:0.08 })
  const { data, addCertificate, updateCertificate, removeCertificate } = usePortfolio()
  const { isEditMode } = useAdmin()
  const certs = data.certificates ?? []

  return (
    <section ref={ref} style={{ padding:'7rem 0' }}>
      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>

        <motion.div initial={{ opacity:0,y:36 }} animate={inView?{ opacity:1,y:0 }:{}}
          transition={{ duration:0.65,ease:[0.22,1,0.36,1] }}
          style={{ textAlign:'center',marginBottom:'1rem' }}>
          <span style={SL}>05 — Certificates</span>
          <h2 style={H2}>My <span style={GR}>Certifications</span></h2>
        </motion.div>

        <motion.p initial={{ opacity:0 }} animate={inView?{ opacity:1 }:{}} transition={{ delay:0.2 }}
          style={{ textAlign:'center',color:'#64748b',fontSize:'0.92rem',marginBottom:'3.5rem',fontFamily:'"DM Sans",sans-serif',maxWidth:'500px',margin:'0.5rem auto 3.5rem' }}>
          Verified credentials from courses, training programs, and platforms.
        </motion.p>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px',maxWidth:'64rem',margin:'0 auto' }}>
          {certs.map((cert, i) => {
            const c = CERT_COLORS[i % CERT_COLORS.length]
            return (
              <motion.div key={cert.id}
                initial={{ opacity:0,y:28 }} animate={inView?{ opacity:1,y:0 }:{}}
                transition={{ duration:0.55,delay:i*0.10,ease:[0.22,1,0.36,1] }}
                whileHover={{ y:-4,transition:{ duration:0.22 } }}>
                <div
                  style={{ background:'var(--card-bg,rgba(8,15,40,0.72))',backdropFilter:'blur(var(--card-blur,20px))',WebkitBackdropFilter:'blur(var(--card-blur,20px))',border:`1px solid var(--card-border,${c.border})`,borderRadius:'var(--card-radius,16px)',padding:'20px 22px',position:'relative',transition:'box-shadow 0.3s ease',height:'100%',boxSizing:'border-box' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow=`0 8px 36px ${c.glow}`}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='none'}}>

                  {isEditMode && (
                    <button onClick={()=>removeCertificate(cert.id)}
                      style={{ position:'absolute',top:'12px',right:'12px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'6px',padding:'4px 6px',color:'#f87171',cursor:'pointer',lineHeight:1 }}>
                      <Trash2 size={13}/>
                    </button>
                  )}

                  <div style={{ display:'flex',alignItems:'flex-start',gap:'14px' }}>
                    <motion.div whileHover={{ rotate:[0,-10,10,0],scale:1.1 }} transition={{ duration:0.4 }}
                      style={{ padding:'10px',borderRadius:'11px',background:c.iconBg,flexShrink:0 }}>
                      <Award size={20} color={c.iconColor}/>
                    </motion.div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <h3 style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.98rem',color:'#f1f5f9',margin:'0 0 4px',lineHeight:1.3 }}>
                        {isEditMode
                          ? <EditableText value={cert.title} onChange={v=>updateCertificate(cert.id,{title:v})} as="span"/>
                          : cert.title}
                      </h3>
                      <div style={{ display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap' }}>
                        <span style={{ color:c.iconColor,fontSize:'0.80rem',fontFamily:'"JetBrains Mono",monospace' }}>
                          {isEditMode
                            ? <EditableText value={cert.issuer} onChange={v=>updateCertificate(cert.id,{issuer:v})} as="span"/>
                            : cert.issuer}
                        </span>
                        <span style={{ color:'#334155',fontSize:'0.75rem' }}>&bull;</span>
                        <span style={{ color:'#475569',fontSize:'0.78rem',fontFamily:'"JetBrains Mono",monospace' }}>
                          {isEditMode
                            ? <EditableText value={cert.date} onChange={v=>updateCertificate(cert.id,{date:v})} as="span"/>
                            : cert.date}
                        </span>
                      </div>
                      {isEditMode ? (
                        <input placeholder="Credential URL (optional)" value={cert.credentialUrl}
                          onChange={e=>updateCertificate(cert.id,{credentialUrl:e.target.value})}
                          style={{ marginTop:'10px',width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:'7px',padding:'6px 10px',color:'#94a3b8',fontSize:'0.75rem',fontFamily:'"JetBrains Mono",monospace',outline:'none',boxSizing:'border-box' }}/>
                      ) : cert.credentialUrl ? (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                          style={{ marginTop:'10px',display:'inline-flex',alignItems:'center',gap:'5px',color:c.iconColor,fontSize:'0.75rem',fontFamily:'"JetBrains Mono",monospace',textDecoration:'none',opacity:0.80,transition:'opacity 0.2s' }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.opacity='1'}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.opacity='0.80'}}>
                          <ExternalLink size={11}/> View Credential
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {isEditMode && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
              <button onClick={addCertificate}
                style={{ width:'100%',height:'100%',minHeight:'110px',background:'rgba(99,102,241,0.06)',border:'2px dashed rgba(99,102,241,0.30)',borderRadius:'16px',color:'#818cf8',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',fontFamily:'"JetBrains Mono",monospace',fontSize:'0.80rem',transition:'all 0.2s' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.12)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.06)'}}>
                <Plus size={22}/> Add Certificate
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}