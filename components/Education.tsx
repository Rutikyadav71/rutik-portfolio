'use client'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { GraduationCap } from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { EditableText } from '@/components/admin/EditableText'

const SL: React.CSSProperties = { fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }
const H2: React.CSSProperties = { fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.2rem)',color:'#f1f5f9',margin:0,lineHeight:1.1 }
const GR: React.CSSProperties = { background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }

const ACCENTS = [
  { border:'rgba(99,102,241,0.28)', iconBg:'rgba(99,102,241,0.14)', iconColor:'#818cf8', bar:'linear-gradient(90deg,#6366f1,#06b6d4)', glow:'rgba(99,102,241,0.15)' },
  { border:'rgba(6,182,212,0.20)',  iconBg:'rgba(6,182,212,0.10)',  iconColor:'#22d3ee', bar:'linear-gradient(90deg,#475569,#06b6d4)', glow:'rgba(6,182,212,0.10)' },
  { border:'rgba(139,92,246,0.20)', iconBg:'rgba(139,92,246,0.10)', iconColor:'#a78bfa', bar:'linear-gradient(90deg,#475569,#8b5cf6)', glow:'rgba(139,92,246,0.10)' },
]

export default function Education() {
  const [ref, inView] = useInView({ triggerOnce:true, threshold:0.08 })
  const { data, updateEducation } = usePortfolio()

  return (
    <section ref={ref} style={{ padding:'7rem 0' }}>
      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>

        <motion.div
          initial={{ opacity:0, y:36 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
          style={{ textAlign:'center',marginBottom:'4rem' }}
        >
          <span style={SL}>06 — Education</span>
          <h2 style={H2}>Academic <span style={GR}>Background</span></h2>
        </motion.div>

        <div style={{ maxWidth:'52rem',margin:'0 auto',display:'flex',flexDirection:'column',gap:'16px' }}>
          {data.education.map((edu, i) => {
            const a = ACCENTS[i] ?? ACCENTS[2]
            return (
              <motion.div
                key={edu.id}
                initial={{ opacity:0, x: i % 2 === 0 ? -44 : 44 }}
                animate={inView ? { opacity:1, x:0 } : {}}
                transition={{ duration:0.65, delay:i * 0.14, ease:[0.22,1,0.36,1] }}
                whileHover={{ y:-4, transition:{ duration:0.22 } }}
              >
                <div
                  style={{ background:'var(--card-bg,rgba(8,15,40,0.70))',backdropFilter:'blur(var(--card-blur,20px))',WebkitBackdropFilter:'blur(var(--card-blur,20px))',border:`1px solid var(--card-border,${a.border})`,borderRadius:'var(--card-radius,16px)',padding:'22px 26px',transition:'all 0.3s ease' }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.boxShadow=`0 8px 40px ${a.glow}` }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.boxShadow='none' }}
                >
                  <div style={{ display:'flex',flexWrap:'wrap',alignItems:'flex-start',gap:'18px' }}>
                    <motion.div whileHover={{rotate:[0,-10,10,0],scale:1.1}} transition={{duration:0.4}}
                      style={{ padding:'12px',borderRadius:'12px',background:a.iconBg,color:a.iconColor,flexShrink:0 }}>
                      <GraduationCap size={22} />
                    </motion.div>

                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',gap:'10px',marginBottom:'4px' }}>
                        <h3 style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.05rem',color:'#f1f5f9',margin:0 }}>
                          <EditableText value={edu.degree} onChange={v=>updateEducation(edu.id,{degree:v})} as="span"/>
                        </h3>
                        <span style={{
                          padding:'2px 10px',borderRadius:'9999px',fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',
                          background:edu.badge==='Pursuing'?'rgba(6,182,212,0.10)':'rgba(30,41,59,0.80)',
                          border:edu.badge==='Pursuing'?'1px solid rgba(6,182,212,0.25)':'1px solid rgba(71,85,105,0.40)',
                          color:edu.badge==='Pursuing'?'#06b6d4':'#475569',
                        }}>{edu.badge}</span>
                      </div>

                      <p style={{ color:'#64748b',fontSize:'0.85rem',margin:'0 0 10px' }}>
                        <EditableText value={edu.institution} onChange={v=>updateEducation(edu.id,{institution:v})} as="span"/>
                      </p>

                      <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',gap:'16px',marginBottom:'12px' }}>
                        <span style={{ color:'#e2e8f0',fontSize:'0.88rem',fontFamily:'"JetBrains Mono",monospace',fontWeight:600 }}>
                          <EditableText value={edu.score} onChange={v=>updateEducation(edu.id,{score:v})} as="span"/>
                        </span>
                        <span style={{ color:'#334155',fontSize:'0.82rem',fontFamily:'"JetBrains Mono",monospace' }}>
                          <EditableText value={edu.period} onChange={v=>updateEducation(edu.id,{period:v})} as="span"/>
                        </span>
                      </div>

                      <div style={{ height:'5px',background:'rgba(255,255,255,0.05)',borderRadius:'99px',overflow:'hidden' }}>
                        <motion.div
                          initial={{ width:0 }} animate={inView ? { width:`${edu.scoreValue}%` } : {}}
                          transition={{ duration:1.2,delay:0.4+i*0.13,ease:[0.22,1,0.36,1] }}
                          style={{ height:'100%',background:a.bar,borderRadius:'99px',position:'relative',overflow:'hidden' }}
                        >
                          <motion.div animate={{x:['-100%','200%']}} transition={{duration:1.5,repeat:Infinity,repeatDelay:3,delay:1.5}}
                            style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.30),transparent)' }} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}