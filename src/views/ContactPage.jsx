import SiteNavbar from '../components/SiteNavbar'
import { SCHOOL_IMAGES, SCHOOL_PROFILE } from '../content/siteProfile'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ViviFooter from '../components/ViviFooter'
import { FOOTER_GALLERY_IMAGES } from '../content/schoolMedia'

export default function ContactPage() {
  const revealRef = useScrollReveal({ rootMargin: '0px 0px -10% 0px', threshold: 0.06 })

  return (
    <div ref={revealRef} className="vivi-page min-h-screen bg-[var(--vivi-light)]">
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />

        <header className="vivi-page-header">
          <div className="relative h-[240px]">
            <img src={SCHOOL_IMAGES.classB} alt="Campus" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.55)]" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-4 sm:px-6">
                <h1 className="vivi-heading text-4xl text-white">Contact Us</h1>
              </div>
            </div>
          </div>
        </header>

        <section className="vivi-section">
          <div className="px-4 sm:px-6">
            <div className="mx-auto mb-10 max-w-2xl text-center wow-fade-in-up wow-delay-1">
              <h2 className="vivi-heading text-3xl">Get In Touch</h2>
              <p className="mt-2 text-sm text-slate-600">Reach out for enrollment support and program guidance.</p>
            </div>

            <div className="mb-10 grid gap-4 md:grid-cols-3">
              <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-6 text-center wow-fade-in-up wow-delay-1">
                <p className="text-xl">📍</p>
                <h3 className="mt-2 font-bold text-[var(--vivi-dark)]">Address</h3>
                <p className="mt-1 text-sm text-slate-600">{SCHOOL_PROFILE.contact.address}</p>
              </div>
              <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-6 text-center wow-fade-in-up wow-delay-3">
                <p className="text-xl">✉️</p>
                <h3 className="mt-2 font-bold text-[var(--vivi-dark)]">Email</h3>
                <p className="mt-1 text-sm text-slate-600">{SCHOOL_PROFILE.contact.email}</p>
              </div>
              <div className="scroll-reveal scroll-reveal--up vivi-card rounded-2xl p-6 text-center wow-fade-in-up wow-delay-5">
                <p className="text-xl">📞</p>
                <h3 className="mt-2 font-bold text-[var(--vivi-dark)]">Phone</h3>
                <p className="mt-1 text-sm text-slate-600">{SCHOOL_PROFILE.contact.phone}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-[var(--vivi-light)]">
              <div className="grid lg:grid-cols-2">
                <div className="scroll-reveal scroll-reveal--left p-8">
                  <p className="text-sm text-slate-700">
                    Send a message and we’ll respond with course options, schedules, and next steps.
                  </p>
                  <form
                    className="mt-6 grid gap-3 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      alert('Message sent. We will contact you shortly.')
                    }}
                  >
                    <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Your name" required />
                    <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Your email" type="email" required />
                    <input className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Subject" required />
                    <textarea className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Message" rows={4} required />
                    <button type="submit" className="vivi-btn vivi-btn-primary sm:col-span-2 w-full px-6 py-3 text-sm text-white">
                      Send Message
                    </button>
                  </form>
                </div>
                <div className="scroll-reveal scroll-reveal--right min-h-[420px]">
                  <iframe
                    className="h-full w-full"
                    title="Map"
                    src="https://www.google.com/maps?q=Ibex%20Hill%20Lusaka&output=embed"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>
    </div>
  )
}

