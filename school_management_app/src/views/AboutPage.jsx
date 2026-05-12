import { useState } from 'react'
import AboutAcademyProfile from '../components/about/AboutAcademyProfile'
import AboutClosingSections from '../components/about/AboutClosingSections'
import AboutPageHeader from '../components/about/AboutPageHeader'
import AboutWhoWeAreCard from '../components/about/AboutWhoWeAreCard'
import Footer from '../components/layout/Footer'
import RegisterModal from '../components/registration/RegisterModal'
import { useAboutScrollReveal } from '../hooks/useAboutScrollReveal'

export default function AboutPage() {
  const [signUp, setSignUp] = useState(false)
  useAboutScrollReveal()

  return (
    <div className="min-h-screen bg-gray-50">
      <RegisterModal open={signUp} onClose={() => setSignUp(false)} />

      <AboutPageHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">
        <AboutWhoWeAreCard />
        <AboutAcademyProfile />
        <AboutClosingSections />
      </div>

      <button
        type="button"
        onClick={() => setSignUp(true)}
        className="md:hidden fixed bottom-5 right-5 z-[70] px-5 py-3 rounded-full bg-[#faa853] text-white font-bold text-sm shadow-lg hover:bg-[#e89235] active:scale-95 transition-all"
      >
        Register
      </button>

      <Footer />
    </div>
  )
}
