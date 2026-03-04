// ─── Contact Form ───────────────────────────────────────────────────────────
export interface ContactMessage {
  id?: string
  name: string
  email: string
  message: string
  created_at?: string
}

export interface ContactFormState {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

// ─── Project ─────────────────────────────────────────────────────────────────
export interface Project {
  title: string
  description: string
  tech: string[]
  github?: string
  live?: string
  featured?: boolean
  gradient: string
}

// ─── Skill ───────────────────────────────────────────────────────────────────
export interface SkillCategory {
  label: string
  icon: string
  skills: string[]
  color: string
}

// ─── Experience ──────────────────────────────────────────────────────────────
export interface Experience {
  company: string
  role: string
  period: string
  description: string[]
  tech: string[]
}
