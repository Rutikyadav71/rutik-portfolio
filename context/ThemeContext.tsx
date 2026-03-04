'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// ─── Theme Types ──────────────────────────────────────────────────────────────
export interface ThemeSettings {
    // Background
    bgColor: string
    bgGradientEnabled: boolean
    bgGradient1: string
    bgGradient2: string
    bgGradientDir: string
    bgGlowEnabled: boolean
    bgGlowColor: string

    // Particles
    particleEnabled: boolean
    particleColor: string
    particleDensity: number   // area per particle (lower = more dense)
    particleSpeed: number
    particleSize: number
    particleOpacity: number
    particleMode: 'default' | 'starfield' | 'minimal' | 'subtle-glow' | 'low-motion'

    // Navbar
    navBg: string
    navBlur: number
    navBorderColor: string
    navTextColor: string
    navHoverColor: string
    navActiveColor: string

    // Typography
    globalFont: string
    headingFont: string
    bodyFont: string
    baseFontSize: string   // px number as string e.g. "16"
    headingScale: string
    paragraphSpacing: string

    // Profile frame
    frameBorderColor: string
    frameGlowGradient: string
    frameThickness: number
    frameBgColor: string
}

// ─── Exact defaults matching current design ────────────────────────────────────
export const DEFAULT_THEME: ThemeSettings = {
    // Background — matches layout.tsx body { background:'#020817' }
    bgColor: '#020817',
    bgGradientEnabled: false,
    bgGradient1: '#0d1729',
    bgGradient2: '#020817',
    bgGradientDir: '135deg',
    bgGlowEnabled: false,
    bgGlowColor: 'rgba(99,102,241,0.08)',

    // Particles — matches ParticleField.tsx values exactly
    particleEnabled: true,
    particleColor: '#6366f1',
    particleDensity: 14000,   // from: Math.round((W * H) / 14000)
    particleSpeed: 0.28,    // from: vx: (Math.random()-0.5)*0.28
    particleSize: 2.0,     // from: Math.random()*2.0+0.4 (max size)
    particleOpacity: 0.48,    // from: canvas opacity:0.48
    particleMode: 'default',

    // Navbar — matches Navbar.tsx scrolled values exactly
    navBg: 'rgba(2,8,23,0.88)',
    navBlur: 20,
    navBorderColor: 'rgba(99,102,241,0.12)',
    navTextColor: '#94a3b8',
    navHoverColor: '#f1f5f9',
    navActiveColor: '#818cf8',

    // Typography — matches layout.tsx body style exactly
    globalFont: '"DM Sans",system-ui,sans-serif',
    headingFont: 'Syne,sans-serif',
    bodyFont: '"DM Sans",sans-serif',
    baseFontSize: '16',
    headingScale: '1.0',
    paragraphSpacing: '1.65',

    // Profile frame — matches About.tsx STYLE_OPTS[0] gradient + photo container styles
    frameBorderColor: 'rgba(99,102,241,0.25)',
    frameGlowGradient: 'linear-gradient(135deg,rgba(99,102,241,0.70),rgba(6,182,212,0.60),rgba(139,92,246,0.65))',
    frameThickness: 2,
    frameBgColor: 'rgba(8,15,40,0.8)',
}

const LS_KEY = 'portfolio_theme_v1'

// ─── Context ──────────────────────────────────────────────────────────────────
interface ThemeContextType {
    theme: ThemeSettings
    updateTheme: (patch: Partial<ThemeSettings>) => void
    resetTheme: () => void
    saveThemeToCloud: () => Promise<void>
    themeSaving: boolean
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME)
    const [themeSaving, setThemeSaving] = useState(false)

    // ── Load from localStorage on mount, then try Supabase ──────────────────
    useEffect(() => {
        // 1. Instant: localStorage
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (raw) {
                const saved = JSON.parse(raw) as Partial<ThemeSettings>
                setTheme(t => ({ ...t, ...saved }))
            }
        } catch { }

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
        }).catch(() => { })
    }, [])

    // ── updateTheme — saves to localStorage immediately ──────────────────────
    const updateTheme = useCallback((patch: Partial<ThemeSettings>) => {
        setTheme(prev => {
            const next = { ...prev, ...patch }
            try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { }
            return next
        })
    }, [])

    // ── resetTheme — clears both stores ──────────────────────────────────────
    const resetTheme = useCallback(() => {
        setTheme(DEFAULT_THEME)
        try { localStorage.removeItem(LS_KEY) } catch { }
        // Also clear from Supabase asynchronously
        import('@/lib/supabaseClient').then(async ({ getSupabaseConfig, getSupabaseClient }) => {
            const { valid } = getSupabaseConfig()
            if (!valid) return
            const client = getSupabaseClient()
            try {
                await client
                    .from('portfolio_content')
                    .delete()
                    .eq('key', 'theme_settings')
            } catch (err) {
                console.error(err)
            }
        }).catch(() => { })
    }, [])

    // ── saveThemeToCloud ──────────────────────────────────────────────────────
    const saveThemeToCloud = useCallback(async () => {
        setThemeSaving(true)
        try {
            const { getSupabaseConfig, getSupabaseClient } = await import('@/lib/supabaseClient')
            const { valid } = getSupabaseConfig()
            if (!valid) { alert('Supabase not configured.'); setThemeSaving(false); return }
            const client = getSupabaseClient()
            await client
                .from('portfolio_content')
                .upsert({ key: 'theme_settings', value: theme }, { onConflict: 'key' })
        } catch (err) { console.error('[theme] save failed:', err) }
        setThemeSaving(false)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, saveThemeToCloud, themeSaving }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
    return ctx
}