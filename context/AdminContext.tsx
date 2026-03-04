'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'

interface AdminContextType {
  user:           User | null
  isAdmin:        boolean
  isEditMode:     boolean
  loading:        boolean
  supabaseReady:  boolean
  signIn:         (email: string, password: string) => Promise<{ error: string | null }>
  signOut:        () => Promise<void>
  toggleEditMode: () => void
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user,       setUser]    = useState<User | null>(null)
  const [loading,    setLoading] = useState(true)
  const [isEditMode, setEdit]    = useState(false)
  const [ready,      setReady]   = useState(false)

  useEffect(() => {
    // Dynamically import supabase so it only runs in browser
    import('@/lib/supabaseClient').then(({ getSupabaseConfig, getSupabaseClient }) => {
      const { valid } = getSupabaseConfig()
      setReady(valid)

      if (!valid) {
        setLoading(false)
        return
      }

      const client = getSupabaseClient()

      client.auth.getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user ?? null)
          setLoading(false)
        })
        .catch(() => setLoading(false))

      const { data: { subscription } } = client.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) setEdit(false)
      })

      return () => subscription.unsubscribe()
    })
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    // Always do fresh dynamic import — guarantees we have browser context
    const { getSupabaseConfig, getSupabaseClient } = await import('@/lib/supabaseClient')
    const { valid, url } = getSupabaseConfig()

    if (!valid) {
      return {
        error:
          '🔧 Supabase not configured\n\n' +
          'Create .env.local in your project root with:\n\n' +
          'NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n' +
          'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...\n\n' +
          'Then restart:  npm run dev'
      }
    }

    try {
      const client = getSupabaseClient()
      const { error } = await client.auth.signInWithPassword({ email, password })

      if (error) {
        const m = error.message ?? ''
        if (m.includes('Invalid login credentials'))
          return { error: '❌ Wrong email or password.' }
        if (m.toLowerCase().includes('email not confirmed'))
          return { error: '📧 Email not confirmed.' }
        if (m.includes('fetch') || m.includes('network'))
          return { error: `🌐 Network error reaching Supabase.` }
        return { error: m }
      }

      return { error: null }
    } catch (err: any) {
      const m = String(err?.message ?? err ?? '')
      return {
        error:
          `🌐 Connection failed\n\n` +
          `URL attempted: ${url}\n\n` +
          `Possible causes:\n` +
          `• Supabase project paused (free tier, idle 7+ days)\n` +
          `  → Go to supabase.com and wake your project\n` +
          `• NEXT_PUBLIC_SUPABASE_URL is wrong\n` +
          `• No internet connection\n\n` +
          `Raw error: ${m}`
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    const { getSupabaseConfig, getSupabaseClient } = await import('@/lib/supabaseClient')
    const { valid } = getSupabaseConfig()
    if (valid) await getSupabaseClient().auth.signOut().catch(() => {})
    setUser(null)
    setEdit(false)
  }, [])

  return (
    <AdminContext.Provider value={{
      user,
      isAdmin:       !!user,
      isEditMode,
      loading,
      supabaseReady: ready,
      signIn,
      signOut,
      toggleEditMode: useCallback(() => setEdit(p => !p), []),
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
