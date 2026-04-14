/**
 * loginSecurity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Client-side login attempt tracking.
 * - Tracks attempts in localStorage (survives page refresh, not private tabs)
 * - Locks out after MAX_ATTEMPTS failed tries for LOCKOUT_MS milliseconds
 * - Stores an unlock token in localStorage; if URL has ?unlock=TOKEN the
 *   lockout is cleared (user must read the alert email to get the token)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const LS_KEY   = 'admin_login_security'
const MAX_ATTEMPTS  = 5
const LOCKOUT_MS    = 30 * 60 * 1000   // 30 minutes

export interface LoginSecurityState {
  attempts:    number       // failed attempts since last success
  lockedUntil: number       // epoch ms, 0 = not locked
  unlockToken: string       // random token emailed to owner on lockout
}

function defaultState(): LoginSecurityState {
  return { attempts: 0, lockedUntil: 0, unlockToken: '' }
}

function load(): LoginSecurityState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch { return defaultState() }
}

function save(s: LoginSecurityState) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch {}
}

function randomToken(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns current security snapshot — call before rendering login UI */
export function getSecurityState(): LoginSecurityState {
  const s = load()
  // Auto-expire lockout if time has passed
  if (s.lockedUntil > 0 && Date.now() >= s.lockedUntil) {
    const reset = defaultState()
    save(reset)
    return reset
  }
  return s
}

/** Call on a FAILED login attempt. Returns new state (may be now locked). */
export function recordFailedAttempt(): LoginSecurityState {
  const s = load()
  const attempts = s.attempts + 1

  if (attempts >= MAX_ATTEMPTS) {
    const token: string = randomToken()
    const next: LoginSecurityState = {
      attempts,
      lockedUntil: Date.now() + LOCKOUT_MS,
      unlockToken: token,
    }
    save(next)
    return next
  }

  const next: LoginSecurityState = { ...s, attempts }
  save(next)
  return next
}

/** Call on a SUCCESSFUL login — resets all counters */
export function recordSuccess() {
  save(defaultState())
}

/** Returns remaining attempts before lockout */
export function remainingAttempts(s: LoginSecurityState): number {
  return Math.max(0, MAX_ATTEMPTS - s.attempts)
}

/** Returns true if currently locked out */
export function isLockedOut(s: LoginSecurityState): boolean {
  return s.lockedUntil > 0 && Date.now() < s.lockedUntil
}

/** Returns human-readable countdown string e.g. "28:45" */
export function lockoutCountdown(s: LoginSecurityState): string {
  const ms = Math.max(0, s.lockedUntil - Date.now())
  const m  = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${m}:${sec.toString().padStart(2,'0')}`
}

/**
 * Check the URL for ?unlock=TOKEN. If it matches the stored token,
 * clear the lockout and return true.
 */
export function tryUnlockFromUrl(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  const token  = params.get('unlock')
  if (!token) return false
  const s = load()
  if (s.unlockToken && token === s.unlockToken) {
    save(defaultState())
    // Clean the URL so the token isn't shared accidentally
    const clean = window.location.pathname
    window.history.replaceState({}, '', clean)
    return true
  }
  return false
}

/** Max attempts constant — used in UI */
export const LOGIN_MAX_ATTEMPTS = MAX_ATTEMPTS
