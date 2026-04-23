import { Link } from 'react-router-dom'
import SiteNavbar from '../components/SiteNavbar'
import { CLIENT2_COURSES, SCHOOL_IMAGES, SCHOOL_PROFILE, WHY_CHOOSE_ANVIL } from '../content/siteProfile'
import BrochureProgramsSection from '../components/BrochureProgramsSection'
import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ViviFooter from '../components/ViviFooter'
import RegisterModal from '../components/RegisterModal'

import assetHowToStart from '../assets/school/how-to-start-a-kids-coding-camp.jpg'
import assetImages5 from '../assets/school/images (5).jpg'
import assetIStock128 from '../assets/school/iStock-1288615417.jpg'
import assetIStock825 from '../assets/school/iStock-825187856-b-scaled.jpg'
import assetMG3836 from '../assets/school/MG_3836-scaled.jpg'
import assetSocial from '../assets/school/social_image.webp'

const FOOTER_GALLERY_IMAGES = [assetMG3836, assetIStock825, assetImages5, assetIStock128, assetHowToStart, assetSocial]

export default function ProgramsPage() {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.05 })

  return (
    <div
      ref={revealRef}
      className="vivi-page min-h-screen bg-[var(--vivi-light)] text-[var(--app-text-primary)]"
    >
      <RegisterModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />
        <header className="vivi-page-header">
          <div className="relative h-[220px]">
            <img src={SCHOOL_IMAGES.hero} alt="Classes" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.55)]" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-4 sm:px-6">
                <h1 className="vivi-heading text-4xl text-white">Classes</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-4 sm:px-6">
        <div className="mb-6">
          <h1 className="vivi-heading text-3xl tracking-tight text-slate-900">Programs</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {SCHOOL_PROFILE.name} programs focus on practical projects, structured mentorship, and confidence-building.
          </p>
        </div>
        <div className="mb-6 rounded-xl bg-[var(--anvil-card-faint)] p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Pricing & duration</p>
          <p className="mt-2 text-base font-bold text-[var(--anvil-navy)]">{SCHOOL_PROFILE.pricing.perCourse}</p>
          <p className="mt-1 text-base text-slate-700">
            Duration: <strong>{SCHOOL_PROFILE.pricing.duration}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Payment options: {SCHOOL_PROFILE.pricing.paymentOptions.join(', ')}.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl bg-[var(--anvil-card-faint)] shadow-sm">
          <BrochureProgramsSection />
        </div>

        <section className="mt-10 rounded-xl bg-[var(--anvil-card-faint)] p-5">
          <h2 className="vivi-heading text-2xl text-slate-900">Our Courses</h2>
          <p className="mt-2 text-base text-slate-700">
            A structured pathway from beginner to advanced technology skills for learners aged {SCHOOL_PROFILE.focusAges}.
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {CLIENT2_COURSES.map((c, idx) => (
              <article
                key={c.title}
                className="scroll-reveal scroll-reveal--up group overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--anvil-royal)_14%,white)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ '--reveal-delay': `${idx * 80}ms` }}
              >
                <img
                  src={FOOTER_GALLERY_IMAGES[idx % FOOTER_GALLERY_IMAGES.length]}
                  alt={c.title}
                  className="h-44 w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="p-5">
                  <h3 className="text-xl font-black text-[var(--anvil-navy)]">{c.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-slate-700">{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl bg-[var(--anvil-card-faint)] p-5">
          <h2 className="vivi-heading text-2xl text-slate-900">Why Choose Anvil Coding Academy?</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-5 text-base text-slate-700 md:grid-cols-2">
            {WHY_CHOOSE_ANVIL.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPaymentOpen(true)}
            className="vivi-btn vivi-btn-primary inline-flex rounded-full px-6 py-3 text-sm font-bold text-white"
          >
            Register now
          </button>
        </div>
        </main>
        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>
    </div>
  )
}

