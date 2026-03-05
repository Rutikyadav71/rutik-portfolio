import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'
import { AdminProvider }     from '@/context/AdminContext'
import { PortfolioProvider } from '@/context/PortfolioContext'
import { PlanetProvider }    from '@/context/PlanetContext'
import AdminToolbar          from '@/components/admin/AdminToolbar'
import { ThemeProvider }     from '@/context/ThemeContext'
import ThemeApplicator       from '@/components/ThemeApplicator'
import ConditionalLayers     from '@/components/ConditionalLayers'
import ClientEffects from '@/components/ClientEffects'

export const metadata: Metadata = {
  title:       'Rutik Yadav | Full Stack Developer',
  description: 'Portfolio of Rutik Yadav — Full Stack Developer specialising in Java, Spring Boot and React.js.',
  keywords:    ['Rutik Yadav','Full Stack Developer','Spring Boot','React Developer','Pune'],
  authors:     [{ name:'Rutik Yadav', url:'https://github.com/Rutikyadav71' }],
  robots:      { index:true, follow:true },
  icons:       { icon:'/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: '#020817', width:'device-width', initialScale:1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect first so the font DNS + TLS is resolved before the stylesheet */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/*
          Only load the weights we actually use — saves ~60 KB vs the previous request.
          display=swap  →  text renders immediately in fallback font; swap in when loaded.
          Removed ital variants of DM Sans (not used anywhere).
        */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body
        suppressHydrationWarning
        style={{
          margin:0, padding:0,
          background:'#020817',
          color:'#f1f5f9',
          fontFamily:'"DM Sans", system-ui, sans-serif',
          overflowX:'hidden',
          WebkitFontSmoothing:'antialiased',
          MozOsxFontSmoothing:'grayscale',
        } as React.CSSProperties}
      >
        <ThemeProvider>
        <AdminProvider>
          <PortfolioProvider>
            <PlanetProvider>
              {/*
                Render children FIRST so the hero text is visible instantly.
                Heavy background layers load after without blocking paint.

                Z-INDEX STACK
                  z:1    ThreeBackground  (WebGL sphere — desktop only)
                  z:2    ParticleField    (cosmic dust)
                  z:3    SkillOverlay     (lines + pills — desktop only)
                  z:10   Page content
                  z:20   PlanetSelector
                  z:9000 Navbar
              */}
              {children}
              <ClientEffects />
              <ConditionalLayers />
              <AdminToolbar />
              <ThemeApplicator />
            </PlanetProvider>
          </PortfolioProvider>
        </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}