"use client";
import { Github, Linkedin, Mail, Heart } from 'lucide-react'

const SOCIALS = [
  { icon:Github,   href:'https://github.com/Rutikyadav71',              label:'GitHub'   },
  { icon:Linkedin, href:'https://linkedin.com/in/rutik-yadav-770159296', label:'LinkedIn' },
  { icon:Mail,     href:'mailto:rutikyadav2004@gmail.com',               label:'Email'    },
]
const NAV = [
  { label:'About',    href:'#about'    },
  { label:'Skills',   href:'#skills'   },
  { label:'Projects', href:'#projects' },
  { label:'Contact',  href:'#contact'  },
]

export default function Footer() {
  return (
    <footer style={{ borderTop:'1px solid rgba(255,255,255,0.05)',padding:'3.5rem 0' }}>
      <div style={{ maxWidth:'80rem',margin:'0 auto',padding:'0 clamp(1rem,4vw,2.5rem)' }}>
        <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'24px' }}>

          {/* Logo */}
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
              <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.2rem',background:'linear-gradient(135deg,#818cf8,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>RY</span>
              <span style={{ color:'#334155',fontSize:'0.8rem',fontFamily:'"JetBrains Mono",monospace' }}>{'<dev />'}</span>
            </div>
            <p style={{ margin:'4px 0 0',color:'#334155',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace' }}>Rutik Yadav · Pune, IN</p>
          </div>

          {/* Nav */}
          <nav>
            <ul style={{ display:'flex',flexWrap:'wrap',gap:'24px',listStyle:'none',margin:0,padding:0,justifyContent:'center' }}>
              {NAV.map(l => (
                <li key={l.label}>
                  <a href={l.href} style={{ color:'#475569',fontSize:'0.88rem',fontFamily:'Syne,sans-serif',textDecoration:'none',transition:'color 0.2s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#f1f5f9'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#475569'}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
            {SOCIALS.map(({ icon:Icon,href,label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                style={{ padding:'8px',borderRadius:'8px',color:'#475569',textDecoration:'none',transition:'all 0.2s ease' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color='#f1f5f9';el.style.background='rgba(255,255,255,0.05)'}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color='#475569';el.style.background='transparent'}}>
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div style={{ marginTop:'2rem',paddingTop:'2rem',borderTop:'1px solid rgba(255,255,255,0.04)',display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'12px' }}>
          <p style={{ margin:0,color:'#334155',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace' }}>
            © {new Date().getFullYear()} Rutik Yadav. All rights reserved.
          </p>
          <p style={{ margin:0,color:'#334155',fontSize:'0.72rem',fontFamily:'"JetBrains Mono",monospace',display:'flex',alignItems:'center',gap:'6px' }}>
            Built with Next.js & <Heart size={11} color="#f43f5e" fill="#f43f5e" /> in Pune
          </p>
        </div>
      </div>
    </footer>
  )
}
