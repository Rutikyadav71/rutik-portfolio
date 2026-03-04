'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Send, Github, Linkedin, Mail, MapPin, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react'

const SL: React.CSSProperties = { fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',letterSpacing:'0.28em',textTransform:'uppercase',color:'#06b6d4',marginBottom:'12px',display:'block' }
const H2: React.CSSProperties = { fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.2rem)',color:'#f1f5f9',margin:0,lineHeight:1.1 }
const GR: React.CSSProperties = { background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }

const LINKS = [
  { icon:Mail,     label:'Email',    value:'rutikyadav2004@gmail.com',    href:'mailto:rutikyadav2004@gmail.com',              color:'#f87171', glow:'rgba(248,113,113,0.2)' },
  { icon:Github,   label:'GitHub',   value:'github.com/Rutikyadav71',     href:'https://github.com/Rutikyadav71',              color:'#cbd5e1', glow:'rgba(203,213,225,0.15)' },
  { icon:Linkedin, label:'LinkedIn', value:'rutik-yadav-770159296',        href:'https://linkedin.com/in/rutik-yadav-770159296',color:'#38bdf8', glow:'rgba(56,189,248,0.2)' },
  { icon:MapPin,   label:'Location', value:'Pune, Maharashtra, India',    href:'https://www.google.com/maps/place/Pune,+Maharashtra/@18.5246164,73.8629674,12z/data=!3m1!4b1!4m6!3m5!1s0x3bc2bf2e67461101:0x828d43bf9d9ee343!8m2!3d18.5246091!4d73.8786239!16zL20vMDE1eTJx?entry=ttu&g_ep=EgoyMDI2MDMwMS4xIKXMDSoASAFQAw%3D%3D',                                            color:'#34d399', glow:'rgba(52,211,153,0.2)' },
]

type Status = 'idle'|'loading'|'success'|'error'

export default function Contact() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once:true, margin:'-80px' })
  const [form, setForm]       = useState({ name:'',email:'',message:'' })
  const [focused, setFocused] = useState<string|null>(null)
  const [status, setStatus]   = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    const SVC=process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID||''
    const TPL=process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID||''
    const KEY=process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY||''
    if (!SVC||!TPL||!KEY) { setStatus('error'); setStatusMsg('EmailJS not configured. Add 3 env vars to .env.local — see README.'); return }
    try {
      const emailjs=(await import('@emailjs/browser')).default
      await emailjs.send(SVC,TPL,{ from_name:form.name,from_email:form.email,message:form.message,to_name:'Rutik Yadav',reply_to:form.email },KEY)
      fetch('/api/contact',{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form) }).catch(()=>{})
      setStatus('success'); setStatusMsg("Message sent! I'll get back to you within 24 hours 🚀"); setForm({name:'',email:'',message:''})
    } catch {
      setStatus('error'); setStatusMsg('Failed to send. Email me: rutikyadav2004@gmail.com')
    }
  }

  const inputStyle = (field:string): React.CSSProperties => ({
    width:'100%', padding:'22px 16px 8px', borderRadius:'12px',
    background:'rgba(15,23,42,0.75)', border:`1px solid ${focused===field?'rgba(99,102,241,0.60)':'rgba(71,85,105,0.50)'}`,
    color:'#f1f5f9', fontSize:'0.93rem', outline:'none', boxSizing:'border-box',
    transition:'border-color 0.2s ease', fontFamily:'"DM Sans",sans-serif',
    boxShadow: focused===field?'0 0 0 3px rgba(99,102,241,0.10)':'none',
  })

  return (
    <section ref={ref} style={{ padding:'7rem 0',position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',inset:'auto 0 0',height:'1px',background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)' }} />

      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>

        {/* Header slides up */}
        <motion.div
          initial={{ opacity:0, y:36 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
          style={{ textAlign:'center',marginBottom:'4rem' }}
        >
          <span style={SL}>06 — Contact</span>
          <h2 style={H2}>Let&apos;s <span style={GR}>Connect</span></h2>
          <motion.p
            initial={{ opacity:0, y:14 }} animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ delay:0.14 }}
            style={{ color:'#64748b',marginTop:'14px',maxWidth:'36rem',margin:'14px auto 0',lineHeight:1.65,fontSize:'0.97rem' }}>
            Open to full-time roles, internships, and interesting collaborations. Reach out and let&apos;s talk.
          </motion.p>
        </motion.div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,24rem),1fr))',gap:'32px',alignItems:'start' }}>

          {/* Left — slides from left */}
          <motion.div
            initial={{ opacity:0, x:-44 }} animate={inView ? { opacity:1, x:0 } : {}}
            transition={{ duration:0.65, delay:0.12, ease:[0.22,1,0.36,1] }}
            style={{ display:'flex',flexDirection:'column',gap:'14px' }}
          >
            {LINKS.map(({ icon:Icon,label,value,href,color,glow },i) => (
              <motion.a key={label} href={href} target={href.startsWith('http')?'_blank':undefined}
                rel={href.startsWith('http')?'noopener noreferrer':undefined}
                initial={{ opacity:0, x:-24 }} animate={inView ? { opacity:1, x:0 } : {}}
                transition={{ delay:0.22+i*0.08 }}
                whileHover={{ x:5 }}
                style={{ display:'flex',alignItems:'center',gap:'16px',padding:'16px 20px',borderRadius:'14px',background:'rgba(8,15,40,0.65)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.06)',textDecoration:'none',transition:'all 0.25s ease' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=`${color}44`;el.style.boxShadow=`0 6px 28px ${glow}`}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(255,255,255,0.06)';el.style.boxShadow='none'}}>
                <div style={{ width:42,height:42,borderRadius:'10px',background:`${color}14`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Icon size={19} color={color} />
                </div>
                <div>
                  <p style={{ margin:0,color:'#475569',fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',textTransform:'uppercase',letterSpacing:'0.16em' }}>{label}</p>
                  <p style={{ margin:'3px 0 0',color:'#cbd5e1',fontSize:'0.88rem' }}>{value}</p>
                </div>
              </motion.a>
            ))}

            {/* Availability badge */}
            <motion.div
              initial={{ opacity:0, y:14 }} animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ delay:0.56 }}
              style={{ marginTop:'8px',padding:'16px 20px',borderRadius:'14px',background:'rgba(52,211,153,0.05)',border:'1px solid rgba(52,211,153,0.18)',position:'relative',overflow:'hidden' }}
            >
              <motion.div animate={{x:['-100%','200%']}} transition={{duration:3,repeat:Infinity,repeatDelay:4}}
                style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(52,211,153,0.07),transparent)',pointerEvents:'none' }} />
              <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px' }}>
                <motion.div animate={{scale:[1,1.5,1]}} transition={{duration:1.5,repeat:Infinity}}
                  style={{ width:8,height:8,borderRadius:'50%',background:'#34d399',flexShrink:0 }} />
                <span style={{ color:'#34d399',fontSize:'0.68rem',fontFamily:'"JetBrains Mono",monospace',fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase' }}>Available for hire</span>
              </div>
              <p style={{ margin:0,color:'#64748b',fontSize:'0.82rem',lineHeight:1.55 }}>
                Graduating 2026 · Actively seeking full-time roles in Software Developement
              </p>
            </motion.div>
          </motion.div>

          {/* Right — slides from right */}
          <motion.div
            initial={{ opacity:0, x:44 }} animate={inView ? { opacity:1, x:0 } : {}}
            transition={{ duration:0.65, delay:0.20, ease:[0.22,1,0.36,1] }}
          >
            <div style={{ background:'rgba(8,15,40,0.70)',backdropFilter:'blur(22px)',WebkitBackdropFilter:'blur(22px)',border:'1px solid rgba(99,102,241,0.18)',borderRadius:'18px',padding:'28px',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',inset:-1,borderRadius:'18px',background:'linear-gradient(135deg,rgba(99,102,241,0.4),rgba(6,182,212,0.2),rgba(139,92,246,0.3))',zIndex:-1,opacity:0.5 }} />

              <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'24px' }}>
                <motion.div animate={{rotate:[0,10,-10,0]}} transition={{duration:3,repeat:Infinity,repeatDelay:2}}>
                  <Sparkles size={17} color="#6366f1" />
                </motion.div>
                <h3 style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'#f1f5f9' }}>Send a message</h3>
              </div>

              <AnimatePresence mode="wait">
                {status==='success' ? (
                  <motion.div key="success" initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                    style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'16px',padding:'40px 0',textAlign:'center' }}>
                    <div style={{ padding:'20px',borderRadius:'50%',background:'rgba(52,211,153,0.10)',border:'1px solid rgba(52,211,153,0.25)',color:'#34d399' }}>
                      <CheckCircle size={44} />
                    </div>
                    <div>
                      <p style={{ margin:'0 0 6px',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.4rem',color:'#f1f5f9' }}>Message Sent! 🎉</p>
                      <p style={{ margin:0,color:'#64748b',fontSize:'0.88rem',maxWidth:'22rem',lineHeight:1.6 }}>{statusMsg}</p>
                    </div>
                    <button onClick={()=>setStatus('idle')}
                      style={{ padding:'10px 22px',borderRadius:'10px',border:'1px solid rgba(99,102,241,0.30)',background:'transparent',color:'#818cf8',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:500,fontSize:'0.88rem' }}>
                      Send another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onSubmit={handleSubmit}
                    style={{ display:'flex',flexDirection:'column',gap:'18px' }}>
                    <div style={{ position:'relative' }}>
                      <label style={{ position:'absolute',left:'16px',top:form.name||focused==='name'?'6px':'15px',fontSize:form.name||focused==='name'?'0.68rem':'0.88rem',color:focused==='name'?'#6366f1':'#64748b',transition:'all 0.18s ease',pointerEvents:'none',zIndex:1 }}>
                        Your name
                      </label>
                      <input name="name" type="text" required value={form.name} onChange={handleChange}
                        onFocus={()=>setFocused('name')} onBlur={()=>setFocused(null)} style={inputStyle('name')} />
                    </div>
                    <div style={{ position:'relative' }}>
                      <label style={{ position:'absolute',left:'16px',top:form.email||focused==='email'?'6px':'15px',fontSize:form.email||focused==='email'?'0.68rem':'0.88rem',color:focused==='email'?'#6366f1':'#64748b',transition:'all 0.18s ease',pointerEvents:'none',zIndex:1 }}>
                        Email address
                      </label>
                      <input name="email" type="email" required value={form.email} onChange={handleChange}
                        onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)} style={inputStyle('email')} />
                    </div>
                    <div style={{ position:'relative' }}>
                      <label style={{ position:'absolute',left:'16px',top:form.message||focused==='message'?'6px':'15px',fontSize:form.message||focused==='message'?'0.68rem':'0.88rem',color:focused==='message'?'#6366f1':'#64748b',transition:'all 0.18s ease',pointerEvents:'none',zIndex:1 }}>
                        Your message
                      </label>
                      <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                        onFocus={()=>setFocused('message')} onBlur={()=>setFocused(null)} style={{ ...inputStyle('message'),resize:'none' }} />
                    </div>

                    <AnimatePresence>
                      {status==='error' && (
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                          style={{ display:'flex',alignItems:'flex-start',gap:'10px',color:'#f87171',fontSize:'0.82rem',padding:'12px 14px',borderRadius:'10px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.22)',overflow:'hidden' }}>
                          <AlertCircle size={14} style={{ flexShrink:0,marginTop:'2px' }} />
                          <span style={{ lineHeight:1.55 }}>{statusMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button type="submit" disabled={status==='loading'} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                      style={{ padding:'14px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 0 32px rgba(99,102,241,0.35)',opacity:status==='loading'?0.7:1,transition:'opacity 0.2s' }}>
                      {status==='loading' ? <><Loader2 size={17} style={{ animation:'spin 1s linear infinite' }} /> Sending…</> : <><Send size={17}/> Send Message</>}
                    </motion.button>
                    <p style={{ margin:0,textAlign:'center',color:'#334155',fontSize:'0.75rem',fontFamily:'"JetBrains Mono",monospace' }}>
                      Powered by EmailJS · Secure message delivery
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </section>
  )
}
