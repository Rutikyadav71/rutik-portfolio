'use client'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Briefcase, CheckCircle2, Plus } from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin } from '@/context/AdminContext'
import { EditableText } from '@/components/admin/EditableText'

const SL: React.CSSProperties   = { fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }
const H2: React.CSSProperties   = { fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.2rem)',color:'#f1f5f9',margin:0,lineHeight:1.1 }
const GR: React.CSSProperties   = { background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }
const PILL: React.CSSProperties = { display:'inline-block',padding:'4px 12px',borderRadius:'9999px',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace',fontWeight:500,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.20)',color:'#a5b4fc',whiteSpace:'nowrap' as const }

export default function Experience() {
  const [ref, inView] = useInView({ triggerOnce:true, threshold:0.08 })
  const { data, updateExperience, addExperience } = usePortfolio()
  const { isAdmin, isEditMode } = useAdmin()

  return (
    <section ref={ref} style={{ padding:'7rem 0',position:'relative' }}>
      <div style={{ position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',width:'18rem',height:'18rem',background:'radial-gradient(circle,rgba(99,102,241,0.05),transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />

      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>

        <motion.div
          initial={{ opacity:0, y:36 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
          style={{ textAlign:'center',marginBottom:'4rem' }}
        >
          <span style={SL}>04 — Experience</span>
          <h2 style={H2}>Where I&apos;ve <span style={GR}>Worked</span></h2>
        </motion.div>

        <div style={{ position:'relative',maxWidth:'52rem',margin:'0 auto' }}>
          {/* Animated timeline line */}
          <motion.div
            initial={{ scaleY:0 }} animate={inView ? { scaleY:1 } : {}}
            transition={{ duration:1, ease:'easeOut', delay:0.2 }}
            style={{ position:'absolute',left:'22px',top:0,bottom:0,width:'1px',background:'linear-gradient(180deg,#6366f1,#06b6d4,transparent)',transformOrigin:'top' }}
          />

          {data.experience.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity:0, x:-44 }}
              animate={inView ? { opacity:1, x:0 } : {}}
              transition={{ duration:0.65, delay:0.15 + i * 0.15, ease:[0.22,1,0.36,1] }}
              style={{ paddingLeft:'72px',position:'relative',marginBottom:'28px' }}
            >
              {/* Timeline dot */}
              <motion.div
                initial={{ scale:0 }} animate={inView ? { scale:1 } : {}}
                transition={{ delay:0.35 + i * 0.15, type:'spring', stiffness:300 }}
                style={{ position:'absolute',left:'14px',top:'24px',width:'18px',height:'18px',borderRadius:'50%',background:'#6366f1',boxShadow:'0 0 14px rgba(99,102,241,0.6)',zIndex:1,border:'3px solid #020817' }}
              />

              <div
                style={{ background:'rgba(8,15,40,0.68)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',padding:'24px 28px',transition:'all 0.3s ease' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(99,102,241,0.30)';el.style.boxShadow='0 8px 40px rgba(99,102,241,0.12)';el.style.transform='translateX(4px)'}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.07)';el.style.boxShadow='none';el.style.transform='translateX(0)'}}
              >
                <div style={{ display:'flex',flexWrap:'wrap',alignItems:'flex-start',justifyContent:'space-between',gap:'14px',marginBottom:'18px' }}>
                  <div style={{ display:'flex',alignItems:'flex-start',gap:'14px' }}>
                    <motion.div whileHover={{rotate:[0,-15,15,0],scale:1.1}} transition={{duration:0.4}}
                      style={{ padding:'10px',borderRadius:'12px',background:'rgba(99,102,241,0.12)',color:'#6366f1',flexShrink:0 }}>
                      <Briefcase size={20}/>
                    </motion.div>
                    <div>
                      <h3 style={{ fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'#f1f5f9',margin:'0 0 3px' }}>
                        <EditableText value={exp.role} onChange={v=>updateExperience(exp.id,{role:v})} as="span"/>
                      </h3>
                      <span style={{ color:'#6366f1',fontWeight:600,fontSize:'0.9rem',display:'block',margin:'2px 0' }}>
                        <EditableText value={exp.company} onChange={v=>updateExperience(exp.id,{company:v})}/>
                      </span>
                      <span style={{ color:'#475569',fontSize:'0.78rem',fontFamily:'"JetBrains Mono",monospace',display:'block' }}>
                        <EditableText value={exp.type} onChange={v=>updateExperience(exp.id,{type:v})}/>
                      </span>
                    </div>
                  </div>
                  <span style={PILL}><EditableText value={exp.period} onChange={v=>updateExperience(exp.id,{period:v})}/></span>
                </div>

                <ul style={{ listStyle:'none',margin:'0 0 18px',padding:0,display:'flex',flexDirection:'column',gap:'10px' }}>
                  {exp.bullets.map((point, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity:0, x:-12 }} animate={inView ? { opacity:1, x:0 } : {}}
                      transition={{ delay:0.5 + i * 0.15 + j * 0.06 }}
                      style={{ display:'flex',gap:'10px',color:'#94a3b8',fontSize:'0.88rem',lineHeight:1.65 }}
                    >
                      <CheckCircle2 size={15} style={{ color:'#06b6d4',flexShrink:0,marginTop:'3px' }}/>
                      <span><EditableText value={point} onChange={v=>{const b=[...exp.bullets];b[j]=v;updateExperience(exp.id,{bullets:b})}} as="span" multiline/></span>
                    </motion.li>
                  ))}
                </ul>

                <div style={{ display:'flex',flexWrap:'wrap',gap:'8px',paddingTop:'14px',borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                  {exp.tech.map(t=>(
                    <motion.span key={t} whileHover={{scale:1.08,y:-2}} style={PILL}>{t}</motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {isAdmin && isEditMode && (
            <motion.button onClick={addExperience} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
              style={{ marginLeft:'72px',width:'calc(100% - 72px)',background:'rgba(8,15,40,0.55)',border:'2px dashed rgba(99,102,241,0.28)',borderRadius:'16px',padding:'22px',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'#475569',cursor:'pointer',fontFamily:'Syne,sans-serif',fontSize:'0.9rem',transition:'all 0.2s' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(99,102,241,0.60)';el.style.color='#818cf8'}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(99,102,241,0.28)';el.style.color='#475569'}}>
              <Plus size={18}/> Add Experience
            </motion.button>
          )}
          {(!isAdmin || !isEditMode) && (
            <motion.p
              initial={{opacity:0}} animate={inView ? {opacity:1} : {}} transition={{delay:0.6}}
              style={{ paddingLeft:'72px',color:'#334155',fontSize:'0.8rem',fontFamily:'"JetBrains Mono",monospace',margin:0 }}>
              More experiences coming soon...
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
