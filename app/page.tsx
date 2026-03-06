import Navbar        from '@/components/Navbar'
import Hero          from '@/components/Hero'
import About         from '@/components/About'
import Skills        from '@/components/Skills'
import Projects      from '@/components/Projects'
import Experience    from '@/components/Experience'
import Certificates  from '@/components/Certificates'
import Education     from '@/components/Education'
import CodingLinks   from '@/components/Codinglinks'
import Contact       from '@/components/Contact'
import Footer        from '@/components/Footer'
import SectionReveal from '@/components/SectionReveal'

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh' }}>

      {/* Fixed radial colour washes */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 80% 55% at 12% 8%,  rgba(99,102,241,0.10) 0%, transparent 65%)',
          'radial-gradient(ellipse 65% 45% at 90% 6%,  rgba(6,182,212,0.07)  0%, transparent 58%)',
          'radial-gradient(ellipse 70% 55% at 3%  88%, rgba(139,92,246,0.08) 0%, transparent 60%)',
        ].join(','),
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.12,
        backgroundImage: 'radial-gradient(rgba(99,102,241,0.22) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* All content */}
      <div style={{ position: 'relative', zIndex: 10, background: 'transparent' }}>
        <Navbar />

        {/* Hero — has own parallax, no wrapper */}
        <section id="hero"><Hero /></section>

        {/* About */}
        <section id="about">
          <SectionReveal variant="slideUp"><About /></SectionReveal>
        </section>

        {/* Skills */}
        <section id="skills">
          <SectionReveal variant="zoomFade"><Skills /></SectionReveal>
        </section>

        {/* Projects */}
        <section id="projects">
          <SectionReveal variant="flipUp"><Projects /></SectionReveal>
        </section>

        {/* Experience */}
        <section id="experience">
          <SectionReveal variant="slideLeft"><Experience /></SectionReveal>
        </section>

        {/* Certificates — above Education */}
        <section id="certificates">
          <SectionReveal variant="slideUp"><Certificates /></SectionReveal>
        </section>

        {/* Education */}
        <section id="education">
          <SectionReveal variant="slideRight"><Education /></SectionReveal>
        </section>

        {/* Coding Profiles */}
        <section id="coding-profiles">
          <SectionReveal variant="zoomFade"><CodingLinks /></SectionReveal>
        </section>

        {/* Contact */}
        <section id="contact">
          <SectionReveal variant="fadeBlur"><Contact /></SectionReveal>
        </section>

        <Footer />
      </div>
    </main>
  )
}