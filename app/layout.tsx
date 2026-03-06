import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AdminProvider }     from '@/context/AdminContext'
import { PortfolioProvider } from '@/context/PortfolioContext'
import { PlanetProvider }    from '@/context/PlanetContext'
import AdminToolbar          from '@/components/admin/AdminToolbar'
import { ThemeProvider }     from '@/context/ThemeContext'
import ThemeApplicator       from '@/components/ThemeApplicator'
import ConditionalLayers     from '@/components/ConditionalLayers'
import ClientEffects         from '@/components/ClientEffects'

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@400;600;700;900&family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Exo+2:wght@700;800;900&display=swap"
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