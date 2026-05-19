import { useState } from 'react'
import PartnersPageHeader from '../components/partners/PartnersPageHeader'
import PartnersGrid from '../components/partners/PartnersGrid'
import Footer from '../components/layout/Footer'
import RegisterModal from '../components/registration/RegisterModal'
import { useLandingSiteContent } from '../hooks/useLandingSiteContent'

export default function PartnersPage() {
  const [signUp, setSignUp] = useState(false)
  const { data: site } = useLandingSiteContent()

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <RegisterModal open={signUp} onClose={() => setSignUp(false)} />

      <PartnersPageHeader title={site.partners_page_title} subtitle={site.partners_page_subtitle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <p className="site-body max-w-3xl mx-auto text-center mb-10 md:mb-12">{site.partners_intro}</p>
        <PartnersGrid partners={site.partners_items} showActivity />
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
