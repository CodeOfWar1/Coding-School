import { useMemo, useState } from 'react'
import SiteNavbar from '../components/SiteNavbar'
import { FAQ_ITEMS, SCHOOL_IMAGES, SCHOOL_PROFILE } from '../content/siteProfile'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ViviFooter from '../components/ViviFooter'

import assetHowToStart from '../assets/school/how-to-start-a-kids-coding-camp.jpg'
import assetImages5 from '../assets/school/images (5).jpg'
import assetIStock128 from '../assets/school/iStock-1288615417.jpg'
import assetIStock825 from '../assets/school/iStock-825187856-b-scaled.jpg'
import assetMG3836 from '../assets/school/MG_3836-scaled.jpg'
import assetSocial from '../assets/school/social_image.webp'

const FOOTER_GALLERY_IMAGES = [assetMG3836, assetIStock825, assetImages5, assetIStock128, assetHowToStart, assetSocial]

export default function FAQPage() {
  const [open, setOpen] = useState(FAQ_ITEMS[0]?.q ?? '')
  const items = useMemo(() => FAQ_ITEMS, [])
  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.06 })

  return (
    <div ref={revealRef} className="vivi-page min-h-screen bg-[var(--vivi-light)] text-[var(--app-text-primary)]">
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />
        <header className="vivi-page-header">
          <div className="relative h-[220px]">
            <img src={SCHOOL_IMAGES.lab} alt="FAQ" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.55)]" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-4 sm:px-6">
                <h1 className="vivi-heading text-4xl text-white">FAQ</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-4 sm:px-6">
        <div className="mb-6">
          <h1 className="vivi-heading text-3xl tracking-tight text-slate-900">FAQ</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Quick answers about programs, portals, grading, and events.</p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((it, idx) => {
            const isOpen = open === it.q
            return (
              <section
                key={it.q}
                className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-4"
                style={{ '--reveal-delay': `${idx * 60}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? '' : it.q)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <h2 className="text-base font-bold text-slate-900">{it.q}</h2>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && <p className="mt-3 text-sm text-slate-600">{it.a}</p>}
              </section>
            )
          })}
        </div>
        </main>
        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>
    </div>
  )
}

