import { createClient, SupabaseClient } from '@supabase/supabase-js'

/** Reads env vars fresh every call (avoids SSR/module-load-time issues) */
export function getSupabaseConfig() {
  const url = (typeof window !== 'undefined'
    ? window.__NEXT_DATA__?.props?.pageProps?.supabaseUrl
    : undefined) ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const valid =
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    key.length > 20
  return { url, key, valid }
}

/** Cached browser client — recreated if env vars change */
let _client: SupabaseClient | null = null
let _clientUrl = ''

export function getSupabaseClient(): SupabaseClient {
  const { url, key, valid } = getSupabaseConfig()
  // If already created with correct URL, reuse
  if (_client && _clientUrl === url) return _client
  // Create fresh client (may be with placeholder — callers should check valid first)
  _client = createClient(
    valid ? url : 'https://placeholder.supabase.co',
    valid ? key : 'placeholder-anon-key-placeholder-anon-key-placeholder',
  )
  _clientUrl = url
  return _client
}

/** Convenience export — use getSupabaseClient() for fresh lookups */
export const supabase = getSupabaseClient()
export const isSupabaseConfigured = getSupabaseConfig().valid
