'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Download, ExternalLink, FileText } from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin }     from '@/context/AdminContext'
import { useTheme }     from '@/context/ThemeContext'

const LINKS = [
  { label: 'About',      href: '#about'        },
  { label: 'Skills',     href: '#skills'       },
  { label: 'Projects',   href: '#projects'     },
  { label: 'Experience', href: '#experience'   },
  { label: 'Certs',      href: '#certificates' },
  { label: 'Education',  href: '#education'    },
  { label: 'Contact',    href: '#contact'      },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active,     setActive]     = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlDraft,   setUrlDraft]   = useState('')

  const { data, updateHero } = usePortfolio()
  const { isEditMode }       = useAdmin()
  const { theme }            = useTheme()
  const resumeUrl = data.hero?.resumeUrl ?? ''
  const profilesEnabled = data.linksSection?.enabled ?? false

  // Inject "Profiles" link before "Contact" only when that section is active
  const navLinks = profilesEnabled
    ? [...LINKS.slice(0, -1), { label: 'Profiles', href: '#coding-profiles' }, LINKS[LINKS.length - 1]]
    : LINKS

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    // Close mobile menu on resize to desktop
    const onResize = () => { if (window.innerWidth >= 900) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const goto = (href: string) => {
    setMobileOpen(false); setActive(href)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleResumeClick = () => {
    if (isEditMode) { setUrlDraft(resumeUrl); setEditingUrl(true); return }
    if (!resumeUrl) { alert('No resume URL set.\n\nEnter Edit Mode and click "Resume ✎" to add your PDF link.'); return }
    setShowModal(true)
  }

  const saveUrl = () => { updateHero({ resumeUrl: urlDraft.trim() }); setEditingUrl(false) }

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000,
        background: scrolled ? theme.navBg : 'transparent',
        backdropFilter: scrolled ? `blur(${theme.navBlur}px)` : 'none',
        WebkitBackdropFilter: scrolled ? `blur(${theme.navBlur}px)` : 'none',
        borderBottom: scrolled ? `1px solid ${theme.navBorderColor}` : 'none',
        transition: 'all 0.4s ease',
      }}>
        <nav style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 clamp(12px, 3vw, 28px)',
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <motion.a href="#" onClick={e => { e.preventDefault(); goto('#hero') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', cursor: 'pointer', flexShrink: 0 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.25rem',
              background: 'linear-gradient(135deg,#818cf8,#06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>RY</span>
            <span style={{ color: '#64748b', fontSize: '0.80rem', fontFamily: '"JetBrains Mono",monospace', display: 'none' }}
              className="nav-dev-tag">{'<dev />'}</span>
          </motion.a>

          {/* Desktop nav links — hidden below 900px */}
          <ul className="nav-desktop" style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            listStyle: 'none', margin: 0, padding: 0, flex: 1, justifyContent: 'center',
          }}>
            {navLinks.map(l => (
              <li key={l.href}>
                <button style={{
                  padding: '7px 10px', borderRadius: '8px', border: 'none',
                  background: active === l.href ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: active === l.href ? '#e2e8f0' : '#94a3b8',
                  fontSize: '0.82rem', fontFamily: 'Syne,sans-serif', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', outline: 'none',
                }}
                  onClick={() => goto(l.href)}
                  onMouseEnter={e => { if (active !== l.href)(e.currentTarget as HTMLElement).style.color = '#e2e8f0' }}
                  onMouseLeave={e => { if (active !== l.href)(e.currentTarget as HTMLElement).style.color = '#94a3b8' }}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop resume button */}
          <motion.button className="nav-desktop" onClick={handleResumeClick}
            style={{
              flexShrink: 0, padding: '8px 18px', borderRadius: '12px', border: 'none',
              background: isEditMode ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontSize: '0.85rem', fontFamily: 'Syne,sans-serif', fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: isEditMode ? '0 0 20px rgba(245,158,11,0.30)' : '0 0 20px rgba(99,102,241,0.30)',
            }}
            whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
            {isEditMode ? 'Resume ✎' : 'Resume ↗'}
          </motion.button>

          {/* Hamburger button — only visible below 900px */}
          <button className="nav-mobile-btn"
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'none' }}
            onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            style={{
              position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 8999,
              background: 'rgba(2,8,23,0.98)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(99,102,241,0.12)', padding: '8px 16px 20px',
              maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
            }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navLinks.map(l => (
                <li key={l.href}>
                  <button
                    style={{
                      width: '100%', textAlign: 'left', padding: '13px 16px',
                      borderRadius: '10px', border: 'none',
                      background: active === l.href ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: active === l.href ? '#e2e8f0' : '#cbd5e1',
                      fontFamily: 'Syne,sans-serif', fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
                    }}
                    onClick={() => goto(l.href)}>{l.label}
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '10px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { setMobileOpen(false); handleResumeClick() }}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px',
                  background: isEditMode ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontSize: '1rem',
                }}>
                {isEditMode ? 'Resume ✎' : 'View Resume ↗'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resume URL editor (edit mode) ── */}
      <AnimatePresence>
        {editingUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={e => { if (e.target === e.currentTarget) setEditingUrl(false) }}>
            <motion.div initial={{ scale: 0.90, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.90, opacity: 0, y: 20 }}
              style={{ background: 'rgba(8,15,40,0.98)', border: '1px solid rgba(99,102,241,0.30)',
                borderRadius: '20px', padding: 'clamp(20px,4vw,32px)', width: '100%', maxWidth: '520px', backdropFilter: 'blur(24px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <FileText size={22} color="#818cf8"/>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', margin: 0, flex: 1 }}>Set Resume URL</h3>
                <button onClick={() => setEditingUrl(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><X size={18}/></button>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '16px', lineHeight: 1.6 }}>
                Paste a publicly accessible PDF URL.<br/>
                Works with: <span style={{ color: '#818cf8' }}>Google Drive share links</span>, Cloudinary, GitHub raw, or any direct PDF link.
              </p>
              <input value={urlDraft} onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.30)',
                  borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '0.85rem',
                  fontFamily: '"JetBrains Mono",monospace', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}/>
              <p style={{ color: '#475569', fontSize: '0.73rem', marginBottom: '20px', lineHeight: 1.55 }}>
                <strong style={{ color: '#94a3b8' }}>Google Drive tip:</strong> Share → "Anyone with the link" → paste the share URL here.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditingUrl(false)}
                  style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.10)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <motion.button onClick={saveUrl} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '9px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  Save URL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resume viewer modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.88)',
              backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{ width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column',
                background: 'rgba(8,15,40,0.98)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, flexWrap: 'wrap' }}>
                <FileText size={18} color="#818cf8"/>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#f1f5f9', flex: 1, minWidth: '100px' }}>Resume</span>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px',
                    background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.75rem', textDecoration: 'none', border: '1px solid rgba(99,102,241,0.25)', whiteSpace: 'nowrap' }}>
                  <ExternalLink size={12}/> Open
                </a>
                <a href={resumeUrl} download
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '0.75rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  <Download size={12}/> Download
                </a>
                <button onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                  <X size={20}/>
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <iframe
                  src={resumeUrl.includes('drive.google.com') ? resumeUrl.replace('/view', '/preview') : resumeUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }} title="Resume"/>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive CSS — pure CSS media queries, no JS isMobile state needed */}
      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile-btn { display: none !important; }
        .nav-dev-tag { display: inline !important; }

        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (max-width: 500px) {
          .nav-dev-tag { display: none !important; }
        }
      `}</style>
    </>
  )
}