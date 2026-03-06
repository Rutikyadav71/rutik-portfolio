'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Project {
  id: string; title: string; description: string; tech: string[]
  github: string; live: string; featured: boolean; gradient: string
  images: string[]  // Supabase storage public URLs or paths
  projectTag: string  // e.g. "Full Stack", "Backend", "Personal Project"
}
export interface SkillCategory  { id: string; label: string; icon: string; skills: string[]; color: string }
export interface ExperienceItem { id: string; company: string; role: string; period: string; type: string; bullets: string[]; tech: string[] }
export interface EducationItem  { id: string; degree: string; institution: string; period: string; score: string; scoreValue: number; badge: string }
export interface Language       { id: string; name: string; level: string }
export interface Certificate    { id: string; title: string; issuer: string; date: string; credentialUrl: string }
export interface CodingLink     { id: string; platform: string; url: string; username: string; iconType: string }
export type SocialIconType = 'github'|'linkedin'|'mail'|'twitter'|'instagram'|'youtube'|'globe'|'discord'|'telegram'|'whatsapp'|'link'
export interface SocialLink {
  id: string; type: SocialIconType; href: string; label: string
}
export interface SocialStyle {
  size: number; iconSize: number
  bg: string; border: string; color: string; hoverColor: string
  borderRadius: number; gap: number
}

export interface FrameConfig {
  shape: 'portrait' | 'square' | 'circle' | 'wide'
  style: 'gradient' | 'indigo' | 'cyan' | 'gold' | 'none'
  size:  number
}

export interface PortfolioData {
  hero: {
    name: string; roles: string[]; tagline: string
    location: string; available: boolean
    resumeUrl: string
    nameStyle: { fontSize: string; fontFamily: string; color: string; fontWeight?: string }
    roleStyle: { fontSize: string; fontFamily: string; color: string; useGradient: boolean }
    roleAnimStyle: 'typewriter' | 'fade' | 'slide' | 'bounce'
    badgeText: string
    socialLinks: SocialLink[]
    socialStyle: SocialStyle
  }
  about: {
    bio1: string; bio2: string; bio3: string; bio4: string
    goal: string; cgpa: number
    avatarUrl: string
    languages:  Language[]
    highlights: { spec: string; frontend: string; goalLabel: string; graduating: string }
    frameConfig: FrameConfig
  }
  projects:     Project[]
  skills:       SkillCategory[]
  experience:   ExperienceItem[]
  education:    EducationItem[]
  certificates: Certificate[]
  linksSection: {
    enabled:  boolean
    title:    string
    subtitle: string
    links:    CodingLink[]
  }
}

const PORTFOLIO_LS_KEY = 'portfolio_data_v1'

interface PortfolioContextType {
  data:    PortfolioData
  saving:  boolean
  updateHero:  (val: Partial<PortfolioData['hero']>)  => void
  updateAbout: (val: Partial<PortfolioData['about']>) => void
  addLanguage:     () => void
  updateLanguage:  (id: string, val: Partial<Language>) => void
  removeLanguage:  (id: string) => void
  updateProject:   (id: string, val: Partial<Project>) => void
  addProject:      () => void
  removeProject:   (id: string) => void
  updateSkillCategory: (id: string, val: Partial<SkillCategory>) => void
  updateExperience: (id: string, val: Partial<ExperienceItem>) => void
  addExperience:    () => void
  updateEducation:  (id: string, val: Partial<EducationItem>) => void
  addCertificate:    () => void
  updateCertificate: (id: string, val: Partial<Certificate>) => void
  removeCertificate: (id: string) => void
  saveToCloud: () => Promise<void>
  addSocialLink:    () => void
  updateSocialLink: (id: string, val: Partial<SocialLink>) => void
  removeSocialLink: (id: string) => void
  updateSocialStyle:(val: Partial<SocialStyle>) => void
  resetSocialStyle: () => void
  updateLinksSection: (val: Partial<PortfolioData['linksSection']>) => void
  addCodingLink:      () => void
  updateCodingLink:   (id: string, val: Partial<CodingLink>) => void
  removeCodingLink:   (id: string) => void
}

const PortfolioContext = createContext<PortfolioContextType | null>(null)

// ─── Default Data ─────────────────────────────────────────────────────────────
const DEFAULT_DATA: PortfolioData = {
  hero: {
    name: 'Rutik Yadav',
    roles: ['Full Stack Developer', 'Spring Boot Engineer', 'React.js Developer', 'API Architect'],
    tagline: 'Building scalable, production-ready web applications with Java + Spring Boot on the backend and React.js on the frontend.',
    location: "Pune, Maharashtra, India \u00b7 Computer Engineering '26",
    available: true,
    resumeUrl: '',
    nameStyle: { fontSize: 'clamp(3.2rem,8vw,5.5rem)', fontFamily: 'Syne,sans-serif', color: '#f1f5f9', fontWeight: '900' },
    roleStyle: { fontSize: 'clamp(1.2rem,3vw,1.65rem)', fontFamily: 'Syne,sans-serif', color: '#818cf8', useGradient: true },
    roleAnimStyle: 'typewriter',
    badgeText: '✦ Available for opportunities',
    socialLinks: [
      { id: '1', type: 'github',   href: 'https://github.com/Rutikyadav71',               label: 'GitHub'   },
      { id: '2', type: 'linkedin', href: 'https://linkedin.com/in/rutik-yadav-770159296', label: 'LinkedIn' },
      { id: '3', type: 'mail',     href: 'mailto:rutikyadav2004@gmail.com',               label: 'Email'    },
    ],
    socialStyle: {
      size: 44, iconSize: 19,
      bg: 'rgba(8,15,40,0.70)', border: 'rgba(255,255,255,0.06)',
      color: '#94a3b8', hoverColor: '#f1f5f9',
      borderRadius: 12, gap: 10,
    },
  },
  about: {
    bio1: "I'm a Computer Engineering undergraduate (Class of 2026) from Sinhgad Academy of Engineering, Pune, with a CGPA of 8.13.",
    bio2: 'My passion lies in building scalable, production-grade backend systems using Java and Spring Boot, complemented by dynamic frontends in React.js. I love solving real-world problems through clean architecture and well-structured code.',
    bio3: "I've built full-stack applications with role-based authentication, RESTful APIs, and deployed them on cloud platforms. I approach every project with an engineering mindset \u2014 thinking about performance, security, and maintainability from day one.",
    bio4: '',
    avatarUrl: '',
    goal: 'To become a skilled Software Developer \u2014 building scalable, production-grade systems that solve real-world problems and create meaningful impact.',
    cgpa: 8.13,
    languages: [
      { id: '1', name: 'English', level: 'Professional' },
      { id: '2', name: 'Hindi',   level: 'Fluent'       },
      { id: '3', name: 'Marathi', level: 'Native'       },
    ],
    highlights: { spec: 'Java, SQL', frontend: 'React', goalLabel: 'Software Dev', graduating: '2026 \u2014 CSE' },
    frameConfig: { shape: 'portrait', style: 'gradient', size: 220 },
  },
  projects: [
    {
      id: '1', title: 'Employee Management System',
      description: 'A full-stack role-based web application to manage employee records, organizational processes, onboarding, and leave management. Features secure JWT authentication with Spring Security, RESTful APIs with proper exception handling, and real-time backend deployment on Render.',
      tech: ['Java', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'React.js', 'Bootstrap', 'JWT'],
      github: 'https://github.com/Rutikyadav71/Employee_Management_System-backend',
      live: '', featured: true, projectTag: 'Full Stack',
      gradient: 'from-indigo-500/20 via-transparent to-violet-500/10',
      images: [],
    },
    {
      id: '2', title: 'E-Commerce Platform',
      description: 'A full-stack eCommerce platform featuring product listing, cart functionality, and user interaction management. Designed robust backend services for product catalog management and seamlessly integrated frontend components with backend APIs.',
      tech: ['Java', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'React.js', 'Bootstrap', 'REST APIs'],
      github: 'https://github.com/Rutikyadav71/Ecommerce_ry-backend',
      live: '', featured: true, projectTag: 'Full Stack',
      gradient: 'from-cyan-500/15 via-transparent to-indigo-500/10',
      images: [],
    },
  ],
  skills: [
    { id: '1', label: 'Languages', icon: '\u3008/\u3009', skills: ['Java', 'JavaScript', 'TypeScript', 'SQL'], color: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5' },
    { id: '2', label: 'Backend',   icon: '\u2699',         skills: ['Spring Boot', 'Spring Security', 'Spring Data JPA', 'REST APIs', 'JWT', 'JDBC', 'Maven'], color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' },
    { id: '3', label: 'Frontend',  icon: '\u25c8',         skills: ['React.js', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind CSS'], color: 'text-violet-400 border-violet-400/30 bg-violet-400/5' },
    { id: '4', label: 'Database',  icon: '\u2295',         skills: ['MySQL', 'PostgreSQL'], color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' },
    { id: '5', label: 'Tools',     icon: '\u25ce',         skills: ['Git', 'GitHub', 'Docker', 'Postman', 'Maven', 'Render'], color: 'text-amber-400 border-amber-400/30 bg-amber-400/5' },
    { id: '6', label: 'Concepts',  icon: '\u2726',         skills: ['OOP', 'DSA', 'DBMS', 'MVC', 'SDLC', 'Agile', 'CRUD'], color: 'text-rose-400 border-rose-400/30 bg-rose-400/5' },
  ],
  experience: [
    {
      id: '1', company: 'SystemTron', role: 'Web Development Intern',
      period: 'Feb 2025 \u2013 Mar 2025', type: 'Internship \u00b7 Training Program',
      bullets: [
        'Developed 4+ fully responsive mini-projects using HTML, CSS, and JavaScript.',
        'Improved UI responsiveness by 20% by optimizing DOM updates and enhancing page load performance.',
        'Collaborated using Git and GitHub within an Agile workflow.',
        'Gained hands-on exposure to real-world software development lifecycle.',
      ],
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Git', 'GitHub', 'Agile'],
    },
  ],
  education: [
    { id: '1', degree: 'B.E. Computer Engineering', institution: 'Sinhgad Academy of Engineering, Pune', period: '2022 \u2013 2026', score: 'CGPA: 8.13', scoreValue: 81.3, badge: 'Pursuing' },
    { id: '2', degree: 'Class XII \u2014 HSC (Maharashtra Board)', institution: 'Pratibhatai Pawar Jr College, Pune', period: '2022', score: 'Percentage: 62%', scoreValue: 62, badge: 'Completed' },
    { id: '3', degree: 'Class X \u2014 SSC (Maharashtra Board)', institution: 'Pratibhatai Pawar High School, Pune', period: '2019', score: 'Percentage: 82%', scoreValue: 82, badge: 'Completed' },
  ],
  certificates: [
    { id: '1', title: 'Java Full Stack Development', issuer: 'SystemTron', date: 'Mar 2025', credentialUrl: '' },
  ],
  linksSection: {
    enabled:  false,
    title:    'My Coding Profiles',
    subtitle: 'DSA practice, competitive programming & problem solving',
    links: [
      { id: '1', platform: 'LeetCode',        url: 'https://leetcode.com/',         username: 'your-username', iconType: 'leetcode'  },
      { id: '2', platform: 'GeeksForGeeks',   url: 'https://www.geeksforgeeks.org/',username: 'your-username', iconType: 'gfg'       },
      { id: '3', platform: 'HackerRank',      url: 'https://www.hackerrank.com/',   username: 'your-username', iconType: 'hackerrank'},
    ],
  },
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data,   setData]   = useState<PortfolioData>(DEFAULT_DATA)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // 1. Instant restore from localStorage
    try {
      const raw = localStorage.getItem(PORTFOLIO_LS_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PortfolioData>
        if (!saved.linksSection) saved.linksSection = DEFAULT_DATA.linksSection
        if (saved.projects) {
          saved.projects = saved.projects.map((p: Partial<Project>) => ({ images: [] as string[], projectTag: 'Full Stack' as string, ...p } as Project))
        }
        if (!saved.hero?.socialLinks) {
          if (saved.hero) {
            saved.hero.socialLinks = DEFAULT_DATA.hero.socialLinks
            saved.hero.socialStyle = DEFAULT_DATA.hero.socialStyle
          }
        }
        if (saved.about && !saved.about.frameConfig) {
          saved.about.frameConfig = { shape: 'portrait', style: 'gradient', size: 220 }
        }
        setData(prev => ({ ...prev, ...saved }))
      }
    } catch {}

    // 2. Supabase (authoritative)
    async function load() {
      try {
        const { getSupabaseConfig, getSupabaseClient } = await import('@/lib/supabaseClient')
        const { valid } = getSupabaseConfig()
        if (!valid) return
        const client = getSupabaseClient()
        const { data: rows, error } = await client.from('portfolio_content').select('*').eq('key', 'main').single()
        if (!error && rows?.value) {
          const loaded = rows.value as Partial<PortfolioData>
          if (loaded.projects) {
            loaded.projects = loaded.projects.map((p: Partial<Project>) => ({ images: [] as string[], projectTag: 'Full Stack' as string, ...p } as Project))
          }
          if (!loaded.hero?.socialLinks) {
            if (loaded.hero) {
              loaded.hero.socialLinks = DEFAULT_DATA.hero.socialLinks
              loaded.hero.socialStyle = DEFAULT_DATA.hero.socialStyle
            }
          }
          if (loaded.about && !loaded.about.frameConfig) {
            loaded.about.frameConfig = { shape: 'portrait', style: 'gradient', size: 220 }
          }
          if (!loaded.linksSection) {
            loaded.linksSection = DEFAULT_DATA.linksSection
          }
          setData(prev => {
            const next = { ...prev, ...loaded }
            try { localStorage.setItem(PORTFOLIO_LS_KEY, JSON.stringify(next)) } catch {}
            return next
          })
        }
      } catch (err) { console.warn('[portfolio] load failed', err) }
    }
    load()
  }, [])

  // Auto-persist helper
  const persist = (nextData: PortfolioData) => {
    try { localStorage.setItem(PORTFOLIO_LS_KEY, JSON.stringify(nextData)) } catch {}
  }

  const saveToCloud = async () => {
    const { getSupabaseConfig, getSupabaseClient } = await import('@/lib/supabaseClient')
    const { valid } = getSupabaseConfig()
    if (!valid) { alert('Supabase not configured.\n\nAdd your keys to .env.local and restart npm run dev.'); return }
    setSaving(true)
    try {
      // Save to localStorage first (instant)
      persist(data)
      const client = getSupabaseClient()
      const { error } = await client.from('portfolio_content').upsert({ key: 'main', value: data }, { onConflict: 'key' })
      if (error) console.error('[portfolio] Save error:', error.message)
    } catch (err) { console.error('[portfolio] Save failed:', err) }
    setSaving(false)
  }

  const updateHero  = (val: Partial<PortfolioData['hero']>) => setData(d => {
    const next = { ...d, hero: { ...d.hero, ...val } }; persist(next); return next
  })
  const updateAbout = (val: Partial<PortfolioData['about']>) => setData(d => {
    const next = { ...d, about: { ...d.about, ...val } }; persist(next); return next
  })

  const addLanguage    = ()                                  => setData(d => ({ ...d, about: { ...d.about, languages: [...(d.about.languages||[]), { id: Date.now().toString(), name: 'Language', level: 'Level' }] } }))
  const updateLanguage = (id: string, val: Partial<Language>) => setData(d => ({ ...d, about: { ...d.about, languages: (d.about.languages||[]).map(l => l.id===id?{...l,...val}:l) } }))
  const removeLanguage = (id: string)                        => setData(d => ({ ...d, about: { ...d.about, languages: (d.about.languages||[]).filter(l => l.id!==id) } }))

  const updateProject = (id: string, val: Partial<Project>) => setData(d => {
    const next = { ...d, projects: d.projects.map(p => p.id===id?{...p,...val}:p) }; persist(next); return next
  })
  const addProject = () => setData(d => {
    const next = { ...d, projects: [...d.projects, { id: Date.now().toString(), title: 'New Project', description: 'Project description...', tech: ['Tech'], github: '', live: '', featured: false, projectTag: 'Personal Project', gradient: 'from-primary/15 via-transparent to-violet/10', images: [] }] }
    persist(next); return next
  })
  const removeProject = (id: string) => setData(d => {
    const next = { ...d, projects: d.projects.filter(p => p.id!==id) }; persist(next); return next
  })

  const updateSkillCategory = (id: string, val: Partial<SkillCategory>) => setData(d => ({ ...d, skills: d.skills.map(s => s.id===id?{...s,...val}:s) }))

  const updateExperience = (id: string, val: Partial<ExperienceItem>) => setData(d => ({ ...d, experience: d.experience.map(e => e.id===id?{...e,...val}:e) }))
  const addExperience    = () => setData(d => ({ ...d, experience: [...d.experience, { id: Date.now().toString(), company: 'Company', role: 'Your Role', period: '2024 \u2013 Present', type: 'Full-time', bullets: ['What you did here'], tech: ['Tech'] }] }))

  const updateEducation = (id: string, val: Partial<EducationItem>) => setData(d => ({ ...d, education: d.education.map(e => e.id===id?{...e,...val}:e) }))

  const addSocialLink = () => setData(d => {
    const next = { ...d, hero: { ...d.hero, socialLinks: [...(d.hero.socialLinks||[]), { id: Date.now().toString(), type: 'link' as SocialIconType, href: 'https://', label: 'Link' }] } }
    persist(next); return next
  })
  const updateSocialLink = (id: string, val: Partial<SocialLink>) => setData(d => {
    const next = { ...d, hero: { ...d.hero, socialLinks: (d.hero.socialLinks||[]).map(s => s.id===id?{...s,...val}:s) } }
    persist(next); return next
  })
  const removeSocialLink = (id: string) => setData(d => {
    const next = { ...d, hero: { ...d.hero, socialLinks: (d.hero.socialLinks||[]).filter(s => s.id!==id) } }
    persist(next); return next
  })
  const updateSocialStyle = (val: Partial<SocialStyle>) => setData(d => {
    const next = { ...d, hero: { ...d.hero, socialStyle: { ...(d.hero.socialStyle||DEFAULT_DATA.hero.socialStyle), ...val } } }
    persist(next); return next
  })
  const resetSocialStyle = () => setData(d => {
    const next = { ...d, hero: { ...d.hero, socialStyle: DEFAULT_DATA.hero.socialStyle } }
    persist(next); return next
  })

  const updateLinksSection = (val: Partial<PortfolioData['linksSection']>) => setData(d => {
    const next = { ...d, linksSection: { ...d.linksSection, ...val } }; persist(next); return next
  })
  const addCodingLink = () => setData(d => {
    const next = { ...d, linksSection: { ...d.linksSection, links: [...(d.linksSection.links||[]), { id: Date.now().toString(), platform: 'Platform', url: 'https://', username: 'username', iconType: 'link' }] } }
    persist(next); return next
  })
  const updateCodingLink = (id: string, val: Partial<CodingLink>) => setData(d => {
    const next = { ...d, linksSection: { ...d.linksSection, links: (d.linksSection.links||[]).map(l => l.id===id?{...l,...val}:l) } }
    persist(next); return next
  })
  const removeCodingLink = (id: string) => setData(d => {
    const next = { ...d, linksSection: { ...d.linksSection, links: (d.linksSection.links||[]).filter(l => l.id!==id) } }
    persist(next); return next
  })

  const addCertificate    = ()                                     => setData(d => ({ ...d, certificates: [...(d.certificates||[]), { id: Date.now().toString(), title: 'Certificate Title', issuer: 'Issuer / Platform', date: '2025', credentialUrl: '' }] }))
  const updateCertificate = (id: string, val: Partial<Certificate>) => setData(d => ({ ...d, certificates: (d.certificates||[]).map(c => c.id===id?{...c,...val}:c) }))
  const removeCertificate = (id: string)                            => setData(d => ({ ...d, certificates: (d.certificates||[]).filter(c => c.id!==id) }))

  return (
    <PortfolioContext.Provider value={{
      data, saving,
      updateHero, updateAbout,
      addLanguage, updateLanguage, removeLanguage,
      updateProject, addProject, removeProject,
      updateSkillCategory,
      updateExperience, addExperience,
      updateEducation,
      addCertificate, updateCertificate, removeCertificate,
      addSocialLink, updateSocialLink, removeSocialLink, updateSocialStyle, resetSocialStyle,
      updateLinksSection, addCodingLink, updateCodingLink, removeCodingLink,
      saveToCloud,
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be inside PortfolioProvider')
  return ctx
}