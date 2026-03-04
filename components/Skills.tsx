'use client'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin } from '@/context/AdminContext'

const SL: React.CSSProperties = { fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }
const H2: React.CSSProperties = { fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.2rem)',color:'#f1f5f9',margin:0,lineHeight:1.1 }
const GR: React.CSSProperties = { background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }

const CARD_SLIDE = {
  hidden:  { opacity: 0, y: 36, scale: 0.94 },
  visible: { opacity: 1, y: 0,  scale: 1    },
}
const PILL_SLIDE = {
  hidden:  { opacity: 0, scale: 0.75 },
  visible: { opacity: 1, scale: 1    },
}

function SkillCard({ cat, index, inView }: { cat: any; index: number; inView: boolean }) {
  const { updateSkillCategory } = usePortfolio()
  const { isAdmin, isEditMode }  = useAdmin()

  return (
    <motion.div
      variants={CARD_SLIDE}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        style={{ background:'rgba(8,15,40,0.65)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',padding:'24px',height:'100%',position:'relative',overflow:'hidden',transition:'all 0.3s ease' }}
        onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(99,102,241,0.30)';el.style.boxShadow='0 8px 40px rgba(99,102,241,0.12)';el.style.transform='translateY(-3px)'}}
        onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.07)';el.style.boxShadow='none';el.style.transform='translateY(0)'}}
      >
        <div style={{ display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px' }}>
          <motion.div
            whileHover={{ rotate:[0,-10,10,0],scale:1.12 }} transition={{ duration:0.4 }}
            style={{ width:42,height:42,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"JetBrains Mono",monospace',fontWeight:700,fontSize:'1.1rem',flexShrink:0,border:'1px solid rgba(99,102,241,0.3)',background:'rgba(99,102,241,0.08)',color:'#818cf8' }}
          >
            {cat.icon}
          </motion.div>
          <span style={{ fontFamily:'Syne,sans-serif',fontWeight:600,color:'#f1f5f9',fontSize:'1rem' }}>{cat.label}</span>
        </div>

        <div style={{ display:'flex',flexWrap:'wrap',gap:'8px' }}>
          {cat.skills.map((skill: string, si: number) => (
            <motion.span
              key={skill}
              variants={PILL_SLIDE}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ delay: index * 0.08 + si * 0.04, duration: 0.3 }}
              whileHover={{ scale:1.12, y:-3, transition:{duration:0.15} }}
              style={{ display:'inline-block',padding:'5px 12px',borderRadius:'9999px',fontSize:'0.78rem',fontFamily:'"JetBrains Mono",monospace',fontWeight:500,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.20)',color:'#a5b4fc',cursor:'default',transition:'all 0.2s ease',whiteSpace:'nowrap' }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(99,102,241,0.18)';el.style.borderColor='rgba(99,102,241,0.50)';el.style.color='#f8fafc'}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(99,102,241,0.08)';el.style.borderColor='rgba(99,102,241,0.20)';el.style.color='#a5b4fc'}}
            >
              {skill}
            </motion.span>
          ))}
        </div>

        {isAdmin && isEditMode && (
          <input defaultValue={cat.skills.join(', ')}
            onBlur={e => updateSkillCategory(cat.id, { skills: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean) })}
            style={{ marginTop:'12px',width:'100%',background:'rgba(15,23,42,0.8)',border:'1px solid rgba(99,102,241,0.35)',borderRadius:'8px',padding:'6px 10px',fontSize:'0.75rem',color:'#94a3b8',outline:'none' }}
            placeholder="Skill 1, Skill 2, Skill 3"
          />
        )}
      </div>
    </motion.div>
  )
}

export default function Skills() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 })
  const { data } = usePortfolio()

  return (
    <section ref={ref} style={{ padding:'7rem 0',position:'relative',overflow:'hidden' }}>
      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>

        <motion.div
          initial={{ opacity:0, y:36 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
          style={{ textAlign:'center',marginBottom:'4rem' }}
        >
          <span style={SL}>02 — Skills</span>
          <h2 style={H2}>Tech <span style={GR}>Arsenal</span></h2>
          <motion.p
            initial={{ opacity:0, y:16 }} animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ duration:0.55, delay:0.15, ease:[0.22,1,0.36,1] }}
            style={{ color:'#64748b',marginTop:'14px',maxWidth:'36rem',margin:'14px auto 0',fontSize:'0.97rem',lineHeight:1.6 }}
          >
            Technologies I use to build scalable, maintainable, and production-ready applications.
          </motion.p>
        </motion.div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,18rem),1fr))',gap:'18px' }}>
          {data.skills.map((cat, i) => <SkillCard key={cat.id} cat={cat} index={i} inView={inView} />)}
        </div>
      </div>
    </section>
  )
}
