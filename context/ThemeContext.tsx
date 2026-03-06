'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// ─── Theme Types ──────────────────────────────────────────────────────────────
export interface ThemeSettings {
  // Background
  bgColor:           string
  bgGradientEnabled: boolean
  bgGradient1:       string
  bgGradient2:       string
  bgGradientDir:     string
  bgGlowEnabled:     boolean
  bgGlowColor:       string

  // Particles
  particleEnabled:  boolean
  particleColor:    string
  particleDensity:  number   // area per particle (lower = more dense)
  particleSpeed:    number
  particleSize:     number
  particleOpacity:  number
  particleMode:     'default' | 'starfield' | 'minimal' | 'subtle-glow' | 'low-motion'

  // Navbar
  navBg:          string
  navBlur:        number
  navBorderColor: string
  navTextColor:   string
  navHoverColor:  string
  navActiveColor: string

  // Typography
  globalFont:       string
  headingFont:      string
  bodyFont:         string
  baseFontSize:     string   // px number as string e.g. "16"
  headingScale:     string
  paragraphSpacing: string

  // Profile frame
  frameBorderColor: string
  frameGlowGradient: string
  frameThickness:   number
  frameBgColor:     string

  // Cards (shared across sections)
  cardBg:           string
  cardBorder:       string
  cardRadius:       number
  cardBlur:         number   // backdrop blur px

  // Global text color
  globalTextColor:  string

  // Available badge
  badgeBg:          string
  badgeBorder:      string
  badgeTextColor:   string
  badgeDotColor:    string
  badgeFontSize:    number  // rem
}

// ─── Saved theme slot ────────────────────────────────────────────────────────
export interface ThemeSlot {
  name:  string
  theme: ThemeSettings
}

// ─── Exact defaults matching current design ────────────────────────────────────
export const DEFAULT_THEME: ThemeSettings = {
  // Background — matches layout.tsx body { background:'#020817' }
  bgColor:           '#020817',
  bgGradientEnabled: false,
  bgGradient1:       '#0d1729',
  bgGradient2:       '#020817',
  bgGradientDir:     '135deg',
  bgGlowEnabled:     false,
  bgGlowColor:       'rgba(99,102,241,0.08)',

  // Particles — matches ParticleField.tsx values exactly
  particleEnabled:  true,
  particleColor:    '#6366f1',
  particleDensity:  14000,   // from: Math.round((W * H) / 14000)
  particleSpeed:    0.28,    // from: vx: (Math.random()-0.5)*0.28
  particleSize:     2.0,     // from: Math.random()*2.0+0.4 (max size)
  particleOpacity:  0.48,    // from: canvas opacity:0.48
  particleMode:     'default',

  // Navbar — matches Navbar.tsx scrolled values exactly
  navBg:          'rgba(2,8,23,0.88)',
  navBlur:        20,
  navBorderColor: 'rgba(99,102,241,0.12)',
  navTextColor:   '#94a3b8',
  navHoverColor:  '#f1f5f9',
  navActiveColor: '#818cf8',

  // Typography — matches layout.tsx body style exactly
  globalFont:       '"DM Sans",system-ui,sans-serif',
  headingFont:      'Syne,sans-serif',
  bodyFont:         '"DM Sans",sans-serif',
  baseFontSize:     '16',
  headingScale:     '1.0',
  paragraphSpacing: '1.65',

  // Profile frame — matches About.tsx STYLE_OPTS[0] gradient + photo container styles
  frameBorderColor:  'rgba(99,102,241,0.25)',
  frameGlowGradient: 'linear-gradient(135deg,rgba(99,102,241,0.70),rgba(6,182,212,0.60),rgba(139,92,246,0.65))',
  frameThickness:    2,
  frameBgColor:      'rgba(8,15,40,0.8)',

  // Cards — matches Projects/Skills/About card styles
  cardBg:           'rgba(8,15,40,0.72)',
  cardBorder:       'rgba(255,255,255,0.07)',
  cardRadius:       18,
  cardBlur:         20,

  // Global text color
  globalTextColor:  '#f1f5f9',

  // Available badge — matches Hero.tsx badge styles
  badgeBg:          'rgba(52,211,153,0.08)',
  badgeBorder:      'rgba(52,211,153,0.22)',
  badgeTextColor:   '#34d399',
  badgeDotColor:    '#34d399',
  badgeFontSize:    0.78,
}

const LS_KEY = 'portfolio_theme_v1'

// ─── Context ──────────────────────────────────────────────────────────────────
interface ThemeContextType {
  theme:        ThemeSettings
  updateTheme:  (patch: Partial<ThemeSettings>) => void
  resetTheme:   () => void
  saveThemeToCloud: () => Promise<void>
  themeSaving:  boolean
  savedSlots:   ThemeSlot[]
  saveSlot:     (idx: number, name: string) => void
  loadSlot:     (idx: number) => void
  clearSlot:    (idx: number) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,       setTheme]       = useState<ThemeSettings>(DEFAULT_THEME)
  const [themeSaving, setThemeSaving] = useState(false)
  const [savedSlots,  setSavedSlots]  = useState<ThemeSlot[]>([
    { name: 'Slot 1', theme: DEFAULT_THEME },
    { name: 'Slot 2', theme: DEFAULT_THEME },
    { name: 'Slot 3', theme: DEFAULT_THEME },
  ])

  // ── Load from localStorage on mount, then try Supabase ──────────────────
  useEffect(() => {
    // 1. Instant: localStorage
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<ThemeSettings>
        setTheme(t => ({ ...t, ...saved }))
      }
    } catch {}
    try {
      const slots = localStorage.getItem('portfolio_theme_slots_v1')
      if (slots) setSavedSlots(JSON.parse(slots))
    } catch {}
    // Load slots from Supabase if available
    import('@/lib/supabaseClient').then(async ({ getSupabaseConfig, getSupabaseClient }) => {
      try {
        const { valid } = getSupabaseConfig()
        if (!valid) return
        const client = getSupabaseClient()
        const { data: slotsRow } = await client.from('portfolio_content').select('*').eq('key', 'theme_slots').single()
        if (slotsRow?.value && Array.isArray(slotsRow.value)) {
          setSavedSlots(slotsRow.value)
          localStorage.setItem('portfolio_theme_slots_v1', JSON.stringify(slotsRow.value))
        }
      } catch {}
    }).catch(() => {})

    // 2. Supabase override (authoritative, loads async)
    import('@/lib/supabaseClient').then(async ({ getSupabaseConfig, getSupabaseClient }) => {
      const { valid } = getSupabaseConfig()
      if (!valid) return
      const client = getSupabaseClient()
      const { data: rows, error } = await client
        .from('portfolio_content')
        .select('*')
        .eq('key', 'theme_settings')
        .single()
      if (!error && rows?.value) {
        const cloud = rows.value as Partial<ThemeSettings>
        setTheme(t => ({ ...t, ...cloud }))
        // Sync back to localStorage
        localStorage.setItem(LS_KEY, JSON.stringify({ ...DEFAULT_THEME, ...cloud }))
      }
    }).catch(() => {})
  }, [])

  // ── updateTheme — saves to localStorage immediately ──────────────────────
  const updateTheme = useCallback((patch: Partial<ThemeSettings>) => {
    setTheme(prev => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  // ── resetTheme — clears both stores ──────────────────────────────────────
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME)
    try { localStorage.removeItem(LS_KEY) } catch {}
    // Also clear from Supabase asynchronously
    import('@/lib/supabaseClient').then(async ({ getSupabaseConfig, getSupabaseClient }) => {
      const { valid } = getSupabaseConfig()
      if (!valid) return
      const client = getSupabaseClient()
      try { await client.from('portfolio_content').delete().eq('key', 'theme_settings') } catch {}
    }).catch(() => {})
  }, [])

  // ── Slot helpers ─────────────────────────────────────────────────────────────
  const saveSlot = (idx: number, name: string) => {
    setSavedSlots(prev => {
      const next = prev.map((s, i) => i === idx ? { name, theme: { ...theme } } : s)
      try { localStorage.setItem('portfolio_theme_slots_v1', JSON.stringify(next)) } catch {}
      return next
    })
  }
  const loadSlot = (idx: number) => {
    const slot = savedSlots[idx]
    if (slot && slot.theme) setTheme({ ...DEFAULT_THEME, ...slot.theme })
  }
  const clearSlot = (idx: number) => {
    setSavedSlots(prev => {
      const next = prev.map((s, i) => i === idx ? { name: `Slot ${idx + 1}`, theme: DEFAULT_THEME } : s)
      try { localStorage.setItem('portfolio_theme_slots_v1', JSON.stringify(next)) } catch {}
      return next
    })
  }

  // ── saveThemeToCloud ──────────────────────────────────────────────────────
  const saveThemeToCloud = useCallback(async () => {
    setThemeSaving(true)
    try {
      const { getSupabaseConfig, getSupabaseClient } = await import('@/lib/supabaseClient')
      const { valid } = getSupabaseConfig()
      if (!valid) { alert('Supabase not configured.'); setThemeSaving(false); return }
      const client = getSupabaseClient()
      // Save theme settings
      await client
        .from('portfolio_content')
        .upsert({ key: 'theme_settings', value: theme }, { onConflict: 'key' })
      // Save theme slots alongside
      try {
        await client
          .from('portfolio_content')
          .upsert({ key: 'theme_slots', value: savedSlots }, { onConflict: 'key' })
      } catch {} // slots save is best-effort
    } catch (err) { console.error('[theme] save failed:', err) }
    setThemeSaving(false)
  }, [theme, savedSlots])

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, saveThemeToCloud, themeSaving, savedSlots, saveSlot, loadSlot, clearSlot }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}