'use client'
import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

/**
 * ThemeApplicator — applies theme settings as CSS custom properties +
 * injects a <style> tag with !important overrides for global font/color.
 * Default values match the original design exactly.
 */
export default function ThemeApplicator() {
  const { theme } = useTheme()

  useEffect(() => {
    const body = document.body
    const root = document.documentElement

    // ── Background ───────────────────────────────────────────────────────
    if (theme.bgGradientEnabled) {
      body.style.background = `linear-gradient(${theme.bgGradientDir}, ${theme.bgGradient1}, ${theme.bgGradient2})`
    } else {
      body.style.background = theme.bgColor
    }

    // ── Glow overlay ─────────────────────────────────────────────────────
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

    // ── CSS custom properties ────────────────────────────────────────────
    root.style.setProperty('--font-global',         theme.globalFont)
    root.style.setProperty('--font-heading',        theme.headingFont)
    root.style.setProperty('--font-body',           theme.bodyFont)
    root.style.setProperty('--font-size-base',      `${theme.baseFontSize}px`)
    root.style.setProperty('--paragraph-spacing',   theme.paragraphSpacing)
    root.style.setProperty('--global-text',         theme.globalTextColor ?? '#f1f5f9')

    root.style.setProperty('--nav-bg',              theme.navBg)
    root.style.setProperty('--nav-blur',            `${theme.navBlur}px`)
    root.style.setProperty('--nav-border',          theme.navBorderColor)
    root.style.setProperty('--nav-text',            theme.navTextColor)
    root.style.setProperty('--nav-hover',           theme.navHoverColor)
    root.style.setProperty('--nav-active',          theme.navActiveColor)

    root.style.setProperty('--frame-border',        theme.frameBorderColor)
    root.style.setProperty('--frame-glow',          theme.frameGlowGradient)
    root.style.setProperty('--frame-thickness',     `${theme.frameThickness}px`)
    root.style.setProperty('--frame-bg',            theme.frameBgColor)

    root.style.setProperty('--card-bg',             theme.cardBg)
    root.style.setProperty('--card-border',         theme.cardBorder)
    root.style.setProperty('--card-radius',         `${theme.cardRadius ?? 18}px`)
    root.style.setProperty('--card-blur',           `${theme.cardBlur ?? 20}px`)

    root.style.setProperty('--badge-bg',            theme.badgeBg)
    root.style.setProperty('--badge-border',        theme.badgeBorder)
    root.style.setProperty('--badge-text',          theme.badgeTextColor)
    root.style.setProperty('--badge-dot',           theme.badgeDotColor)
    root.style.setProperty('--badge-font-size',     `${theme.badgeFontSize ?? 0.78}rem`)

    // ── Injected <style> for global overrides ────────────────────────────
    // Uses !important for font-family so it wins over React inline styles.
    // Color uses inheritance (not !important) so accent colors are preserved.
    const styleId = '__theme-overrides'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }

    const gText  = theme.globalTextColor ?? '#f1f5f9'
    const gFont  = theme.globalFont
    const gSize  = theme.baseFontSize
    const gSpace = theme.paragraphSpacing

    // !important on font-family lets the CSS win over React inline styles.
    // We intentionally do NOT use !important on color so that explicitly-colored
    // accent spans/headings keep their brand colors (e.g. gradient text).
    // Instead we set color on the body and let it cascade down naturally.
    styleEl.textContent = `
      :root {
        --global-text:    ${gText};
        --font-global:    ${gFont};
        --font-size-base: ${gSize}px;
      }

      /* Global font — body and common containers, but NOT h1/h2 which have per-element inline fonts */
      body { font-family: ${gFont}; }
      body p, body li, body label, body td, body th,
      body section, body article, body footer, body nav { font-family: ${gFont}; }

      /* Global text color — cascades via inheritance */
      body { color: ${gText} !important; font-size: ${gSize}px; line-height: ${gSpace}; }
      body h1, body h2, body h3, body h4, body h5 { color: inherit; }
      body p, body li, body label { color: inherit; line-height: ${gSpace}; }

      /* Preserve gradient text */
      [style*="-webkit-text-fill-color"] { color: transparent !important; }

    `
  }, [theme])

  return null
}