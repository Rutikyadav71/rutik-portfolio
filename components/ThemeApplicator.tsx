'use client'
import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

/**
 * ThemeApplicator — applies theme settings as CSS custom properties
 * and direct body style updates. Renders nothing visible.
 * Default values match the original design exactly, so zero visual change
 * unless the user has edited settings.
 */
export default function ThemeApplicator() {
  const { theme } = useTheme()

  useEffect(() => {
    const body = document.body
    const root = document.documentElement

    // ── Background ─────────────────────────────────────────────────────
    if (theme.bgGradientEnabled) {
      body.style.background = `linear-gradient(${theme.bgGradientDir}, ${theme.bgGradient1}, ${theme.bgGradient2})`
    } else {
      body.style.background = theme.bgColor
    }

    // ── Glow overlay ────────────────────────────────────────────────────
    let glowEl = document.getElementById('__theme-glow')
    if (theme.bgGlowEnabled) {
      if (!glowEl) {
        glowEl = document.createElement('div')
        glowEl.id = '__theme-glow'
        glowEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;'
        document.body.prepend(glowEl)
      }
      glowEl.style.background = `radial-gradient(ellipse at 50% 20%, ${theme.bgGlowColor} 0%, transparent 60%)`
    } else if (glowEl) {
      glowEl.remove()
    }

    // ── Typography CSS variables ─────────────────────────────────────────
    root.style.setProperty('--font-global',  theme.globalFont)
    root.style.setProperty('--font-heading', theme.headingFont)
    root.style.setProperty('--font-body',    theme.bodyFont)
    root.style.setProperty('--font-size-base', `${theme.baseFontSize}px`)
    root.style.setProperty('--paragraph-spacing', theme.paragraphSpacing)

    // Apply base font to body
    body.style.fontFamily  = theme.globalFont
    body.style.fontSize    = `${theme.baseFontSize}px`

    // ── CSS variables for other components to consume ────────────────────
    root.style.setProperty('--nav-bg',           theme.navBg)
    root.style.setProperty('--nav-blur',         `${theme.navBlur}px`)
    root.style.setProperty('--nav-border',       theme.navBorderColor)
    root.style.setProperty('--nav-text',         theme.navTextColor)
    root.style.setProperty('--nav-hover',        theme.navHoverColor)
    root.style.setProperty('--nav-active',       theme.navActiveColor)
    root.style.setProperty('--frame-border',     theme.frameBorderColor)
    root.style.setProperty('--frame-glow',       theme.frameGlowGradient)
    root.style.setProperty('--frame-thickness',  `${theme.frameThickness}px`)
    root.style.setProperty('--frame-bg',         theme.frameBgColor)
  }, [theme])

  return null
}