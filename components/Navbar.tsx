'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Download, ExternalLink, FileText } from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'
import { useAdmin }     from '@/context/AdminContext'
import { useTheme }    from '@/context/ThemeContext'

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
  const [isMobile,   setIsMobile]   = useState(false)
  const [showModal,  setShowModal]  = useState(false)
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlDraft,   setUrlDraft]   = useState('')

  const { data, updateHero } = usePortfolio()
  const { isEditMode }       = useAdmin()
  const { theme }            = useTheme()
  const resumeUrl = data.hero?.resumeUrl ?? ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [])

  const goto = (href: string) => {
    setMobileOpen(false); setActive(href)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleResumeClick = () => {
    if (isEditMode) { setUrlDraft(resumeUrl); setEditingUrl(true); return }
    if (!resumeUrl) { alert('No resume URL set.\n\nEnter Edit Mode and click \u201cResume \u270e\u201d to add your PDF link.'); return }
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
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <motion.a href="#" onClick={e => { e.preventDefault(); goto('#hero') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.25rem',
              background: 'linear-gradient(135deg,#818cf8,#06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>RY</span>
            <span style={{ color: '#64748b', fontSize: '0.82rem', fontFamily: '"JetBrains Mono",monospace' }}>{'<dev />'}</span>
          </motion.a>

          {/* Desktop links */}
          {!isMobile && (
            <ul style={{ display: 'flex', alignItems: 'center', gap: '4px', listStyle: 'none', margin: 0, padding: 0 }}>
              {LINKS.map(l => (
                <li key={l.href}>
                  <button style={{ padding: '8px 12px', borderRadius: '8px', border: 'none',
                    background: active===l.href ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: active===l.href ? '#e2e8f0' : '#94a3b8',
                    fontSize: '0.85rem', fontFamily: 'Syne,sans-serif', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', outline: 'none' }}
                    onClick={() => goto(l.href)}
                    onMouseEnter={e => { if(active!==l.href)(e.currentTarget as HTMLElement).style.color='#e2e8f0' }}
                    onMouseLeave={e => { if(active!==l.href)(e.currentTarget as HTMLElement).style.color='#94a3b8' }}>
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <motion.button onClick={handleResumeClick}
                  style={{ marginLeft: '12px', padding: '8px 20px', borderRadius: '12px', border: 'none',
                    background: isEditMode ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', fontSize: '0.875rem', fontFamily: 'Syne,sans-serif', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: isEditMode ? '0 0 24px rgba(245,158,11,0.35)' : '0 0 24px rgba(99,102,241,0.35)' }}
                  whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                  {isEditMode ? 'Resume \u270e' : 'Resume \u2197'}
                </motion.button>
              </li>
            </ul>
          )}

          {isMobile && (
            <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
              onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
              {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          )}
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 8999,
            background: 'rgba(2,8,23,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(99,102,241,0.12)', padding: '12px 16px 20px' }}
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {LINKS.map(l => (
                <li key={l.href}>
                  <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px',
                    borderRadius: '8px', border: 'none', background: 'transparent',
                    color: '#cbd5e1', fontFamily: 'Syne,sans-serif', fontSize: '0.95rem', cursor: 'pointer' }}
                    onClick={() => goto(l.href)}>{l.label}</button>
                </li>
              ))}
              <li>
                <button onClick={() => { setMobileOpen(false); handleResumeClick() }}
                  style={{ display: 'block', width: '100%', textAlign: 'center', padding: '12px', borderRadius: '10px', marginTop: '8px',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                    fontFamily: 'Syne,sans-serif', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
                  View Resume
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resume URL editor (edit mode) ──────────────────────────────────── */}
      <AnimatePresence>
        {editingUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={e => { if (e.target===e.currentTarget) setEditingUrl(false) }}>
            <motion.div initial={{ scale: 0.90, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.90, opacity: 0, y: 20 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
              style={{ background: 'rgba(8,15,40,0.98)', border: '1px solid rgba(99,102,241,0.30)',
                borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', backdropFilter: 'blur(24px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <FileText size={22} color="#818cf8"/>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#f1f5f9', margin: 0 }}>
                  Set Resume URL
                </h3>
                <button onClick={() => setEditingUrl(false)}
                  style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={18}/>
                </button>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '16px', lineHeight: 1.6 }}>
                Paste a publicly accessible PDF URL.<br/>
                Works with: <span style={{ color: '#818cf8' }}>Google Drive share links</span>, Cloudinary, GitHub raw, or any direct PDF link.
              </p>
              <input value={urlDraft} onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(99,102,241,0.30)', borderRadius: '10px',
                  padding: '11px 14px', color: '#e2e8f0', fontSize: '0.85rem',
                  fontFamily: '"JetBrains Mono",monospace', outline: 'none',
                  boxSizing: 'border-box', marginBottom: '16px' }} />
              <p style={{ color: '#475569', fontSize: '0.73rem', marginBottom: '20px', lineHeight: 1.55 }}>
                <strong style={{ color: '#94a3b8' }}>Google Drive tip:</strong> Share the file &rarr; &ldquo;Anyone with the link&rdquo; &rarr; paste the share URL here.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditingUrl(false)}
                  style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.10)',
                    background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <motion.button onClick={saveUrl} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '9px 22px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  Save URL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resume viewer modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.88)',
              backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => { if (e.target===e.currentTarget) setShowModal(false) }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.30, ease: [0.22,1,0.36,1] }}
              style={{ width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column',
                background: 'rgba(8,15,40,0.98)', border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <FileText size={18} color="#818cf8"/>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#f1f5f9', flex: 1 }}>
                  Resume
                </span>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                    borderRadius: '9px', background: 'rgba(99,102,241,0.15)',
                    color: '#818cf8', fontSize: '0.78rem', fontFamily: '"JetBrains Mono",monospace',
                    textDecoration: 'none', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <ExternalLink size={13}/> Open in new tab
                </a>
                <a href={resumeUrl} download
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                    borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', fontSize: '0.78rem', fontFamily: '"JetBrains Mono",monospace', textDecoration: 'none' }}>
                  <Download size={13}/> Download
                </a>
                <button onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                  <X size={20}/>
                </button>
              </div>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <iframe
                  src={resumeUrl.includes('drive.google.com') ? resumeUrl.replace('/view', '/preview') : resumeUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Resume"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}