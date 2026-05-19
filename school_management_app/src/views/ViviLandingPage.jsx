import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/Sections/Hero'
import About from '../components/Sections/About'
import Classes from '../components/Sections/Classes'
import Team from '../components/Sections/Team'
import Gallery from '../components/Sections/Gallery'
import Partners from '../components/Sections/Partners'
import Testimonials from '../components/Sections/Testimonials'
import Contact from '../components/Sections/Contact'
import RegisterModal from '../components/registration/RegisterModal'
import { useLandingScrollReveal } from '../hooks/useLandingScrollReveal'
import { useLandingSiteContent } from '../hooks/useLandingSiteContent'

export default function ViviLandingPage() {
  const [signUp, setSignUp] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { data: site } = useLandingSiteContent()

  useLandingScrollReveal()

  const sectionRefs = {
    home: useRef(null),
    about: useRef(null),
    classes: useRef(null),
    team: useRef(null),
    gallery: useRef(null),
    partners: useRef(null),
    contact: useRef(null),
  }

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    sectionRefs[sectionId]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            setActiveSection(sectionId)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' }
    )

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <RegisterModal open={signUp} onClose={() => setSignUp(false)} />

      {site.announcement_banner?.trim() ? (
        <div className="relative z-[60] border-b border-secondary/15 bg-gradient-to-r from-secondary to-[#1a2542] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md">
          {site.announcement_banner.trim()}
        </div>
      ) : null}

      <Navbar
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        onRegisterClick={() => setSignUp(true)}
      />

      <main>
        <Hero
          ref={sectionRefs.home}
          scrollToSection={scrollToSection}
          onRegisterClick={() => setSignUp(true)}
        />
        <About ref={sectionRefs.about} scrollToSection={scrollToSection} />
        <Classes ref={sectionRefs.classes} onRegisterClick={() => setSignUp(true)} />
        <Team ref={sectionRefs.team} />
        <Gallery ref={sectionRefs.gallery} />
        <Partners ref={sectionRefs.partners} />
        <Testimonials />
        <Contact ref={sectionRefs.contact} />
      </main>

      <button
        type="button"
        onClick={() => setSignUp(true)}
        className="md:hidden fixed bottom-5 right-5 z-[70] px-5 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-hover active:scale-95 transition-all"
      >
        Register
      </button>

      <Footer />
    </div>
  )
}