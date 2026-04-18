import { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNavbar from '../components/SiteNavbar'
import ViviFooter from '../components/ViviFooter'
import { NEWSLETTER_CONTENT, SCHOOL_IMAGES } from '../content/siteProfile'
import { useScrollReveal } from '../hooks/useScrollReveal'

import assetHowToStart from '../assets/school/how-to-start-a-kids-coding-camp.jpg'
import assetImages5 from '../assets/school/images (5).jpg'
import assetIStock128 from '../assets/school/iStock-1288615417.jpg'
import assetIStock825 from '../assets/school/iStock-825187856-b-scaled.jpg'
import assetMG3836 from '../assets/school/MG_3836-scaled.jpg'
import assetSocial from '../assets/school/social_image.webp'

const FOOTER_GALLERY_IMAGES = [assetMG3836, assetIStock825, assetImages5, assetIStock128, assetHowToStart, assetSocial]

export default function NewsletterPage() {
  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.06 })
  const [submitted, setSubmitted] = useState(false)

  return (
    <div ref={revealRef} className="vivi-page min-h-screen bg-[var(--vivi-light)]">
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />

        <header className="vivi-page-header">
          <div className="relative h-[240px]">
            <img src={SCHOOL_IMAGES.classA} alt="Students learning" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.55)]" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-4 sm:px-6">
                <h1 className="vivi-heading text-4xl text-white">Newsletter</h1>
                <p className="mt-2 max-w-xl text-sm text-white/90">{NEWSLETTER_CONTENT.lead}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="vivi-section">
          <div className="px-4 sm:px-6">
            <div className="mx-auto mb-10 max-w-2xl text-center wow-fade-in-up wow-delay-1">
              <h2 className="vivi-heading text-3xl text-[var(--anvil-red)]">{NEWSLETTER_CONTENT.headline}</h2>
              <p className="mt-2 text-sm text-slate-600">{NEWSLETTER_CONTENT.cadence}</p>
            </div>

            <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {NEWSLETTER_CONTENT.topics.map((topic) => (
                <div
                  key={topic.label}
                  className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-5 wow-fade-in-up wow-delay-1"
                >
                  <h3 className="vivi-heading text-lg text-[var(--vivi-dark)]">{topic.label}</h3>
                  <p className="mt-2 text-sm text-slate-600">{topic.description}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto max-w-xl">
              <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-8">
                <h3 className="vivi-heading text-xl text-[var(--vivi-dark)]">Subscribe</h3>
                <p className="mt-2 text-sm text-slate-600">{NEWSLETTER_CONTENT.privacy}</p>
                {submitted ? (
                  <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    Thanks—you’re on the list. Watch your inbox for the next briefing.
                  </p>
                ) : (
                  <form
                    className="mt-6 space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      setSubmitted(true)
                    }}
                  >
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      placeholder="Your name"
                      name="name"
                      autoComplete="name"
                    />
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      placeholder="Your email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                    />
                    <button type="submit" className="vivi-btn vivi-btn-primary w-full px-6 py-3 text-sm text-white">
                      Join the mailing list
                    </button>
                  </form>
                )}
                <p className="mt-6 text-center text-sm text-slate-500">
                  Prefer to reach out first?{' '}
                  <Link to="/contact" className="font-semibold text-[var(--anvil-red)] hover:underline">
                    Contact us
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>
    </div>
  )
}
