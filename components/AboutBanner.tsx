'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Briefcase, Mail, MapPin } from 'lucide-react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const CARD: React.CSSProperties = {
  background: 'var(--card-bg,rgba(8,15,40,0.65))',
  backdropFilter: 'blur(var(--card-blur,20px))',
  WebkitBackdropFilter: 'blur(var(--card-blur,20px))',
  border: '1px solid var(--card-border,rgba(255,255,255,0.07))',
  borderRadius: 'var(--card-radius,16px)',
}

const CONTACT_ROWS = [
  { icon: MapPin, text: 'Pune, India' },
  { icon: Mail, text: 'rutikyadav2004@gmail.com' },
  { icon: Briefcase, text: 'Open to Software Developer Opportunities' },
]

export default function AboutBanner() {
  const sectionRef = useRef<HTMLDivElement>(null)

  // Track scroll progress as the section moves through the viewport.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Smooth out the raw scroll progress so motion feels fluid, not jittery —
  // critical for mobile trackpads / touch scroll which fire irregular deltas.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  })

  // Content panel: slides in from the left as section enters, drifts back out left as it exits.
  const contentX = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [-90, 0, 0, -60])
  const contentOpacity = useTransform(smoothProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0])

  // Poster panel: slides in from the right, drifts further left as section exits (parallax lag vs content).
  const posterX = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [140, 0, 0, -110])
  const posterOpacity = useTransform(smoothProgress, [0, 0.22, 0.82, 1], [0, 1, 1, 0])
  const posterScale = useTransform(smoothProgress, [0, 0.35, 1], [0.92, 1, 0.97])

  // Subtle continuous parallax tilt on the poster while it's in view.
  const posterRotate = useTransform(smoothProgress, [0, 0.5, 1], [-2.2, 0, 1.6])

  return (
    <div ref={sectionRef} style={{ position: 'relative', padding: '2rem 0 4rem' }}>
      <div
        className="about-banner-grid"
        style={{
          display: 'grid',
          alignItems: 'center',
          gap: 'clamp(2rem, 5vw, 4rem)',
        }}
      >
        {/* LEFT — content */}
        <motion.div
          style={{ x: contentX, opacity: contentOpacity, willChange: 'transform, opacity' }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono",monospace', fontSize: '0.70rem',
              letterSpacing: '0.28em', textTransform: 'uppercase', color: '#06b6d4',
              marginBottom: '14px', display: 'block',
            }}
          >
            Java Backend Developer
          </span>
          <h3
            style={{
              fontFamily: 'Syne,sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.6rem,3.4vw,2.5rem)', color: '#f1f5f9',
              margin: '0 0 14px', lineHeight: 1.16,
            }}
          >
            Building secure, scalable{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#818cf8,#06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              production-ready
            </span>{' '}
            web applications.
          </h3>
          <p style={{ margin: '0 0 22px', color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.75, maxWidth: '46ch' }}>
            Spring Boot developer specialising in REST APIs and full-stack applications —
            currently finishing a B.E. in Computer Engineering (2026) and open to
            Software Developer opportunities.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
            {CONTACT_ROWS.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 30, height: 30, borderRadius: '8px',
                    background: 'rgba(99,102,241,0.12)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Icon size={13} color="#818cf8" />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontFamily: '"DM Sans",sans-serif' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Java', 'Spring Boot', 'Hibernate', 'SQL', 'React.js', 'MySQL', 'Docker', 'Git'].map((tag) => (
              <span
                key={tag}
                style={{
                  ...CARD,
                  padding: '6px 13px',
                  fontSize: '0.74rem',
                  fontFamily: '"JetBrains Mono",monospace',
                  color: '#a5b4fc',
                  borderRadius: '999px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — poster */}
        <motion.div
          style={{
            x: posterX,
            opacity: posterOpacity,
            scale: posterScale,
            rotate: posterRotate,
            willChange: 'transform, opacity',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(99,102,241,0.20)',
              boxShadow: '0 20px 60px -20px rgba(99,102,241,0.35)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/poster_linkedin.png"
              alt="Rutik Yadav — Java Backend Developer, Spring Boot Developer"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              loading="lazy"
            />
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), transparent 40%)',
              }}
            />
          </div>
        </motion.div>
      </div>

      <style>{`
        .about-banner-grid {
          grid-template-columns: 1.05fr 1fr;
        }
        @media (max-width: 860px) {
          .about-banner-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem !important;
          }
          .about-banner-grid > *:last-child {
            order: -1;
            max-width: 420px;
            margin: 0 auto;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
