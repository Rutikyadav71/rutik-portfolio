import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:      '#6366f1',
        accent:       '#06b6d4',
        violet:       '#8b5cf6',
        gold:         '#f59e0b',
        dark:         '#020817',
        surface:      '#080f24',
        card:         '#0d1530',
        'card-hover': '#111d40',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow':        '0 0 40px rgba(99,102,241,0.35)',
        'glow-cyan':   '0 0 40px rgba(6,182,212,0.35)',
        'glow-violet': '0 0 40px rgba(139,92,246,0.35)',
        'glow-gold':   '0 0 40px rgba(245,158,11,0.35)',
        'card':        '0 4px 30px rgba(0,0,0,0.55)',
        'card-hover':  '0 8px 60px rgba(99,102,241,0.22)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'float':      'floatY 7s ease-in-out infinite',
        'spin-slow':  'spinCW 22s linear infinite',
        'pulse-slow': 'dotPulse 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
