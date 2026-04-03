import { Link } from 'react-router-dom'
import { SCHOOL_PROFILE } from '../content/siteProfile'

function Icon({ name, className = '' }) {
  const common = `h-4 w-4 ${className}`
  switch (name) {
    case 'map':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 22s7-4.6 7-11a7 7 0 10-14 0c0 6.4 7 11 7 11z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 13.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      )
    case 'phone':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6.6 3.8l2.2-.6c.5-.1 1 .1 1.2.6l1.4 3.2c.2.5.1 1-.3 1.3l-1.6 1.1c1.3 2.7 3.6 5 6.3 6.3l1.1-1.6c.3-.4.9-.5 1.3-.3l3.2 1.4c.5.2.7.7.6 1.2l-.6 2.2c-.1.5-.6.8-1.1.8C10 22.3 1.7 14 1 3.9c0-.5.3-1 .8-1.1z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'mail':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4.5 6.5h15A2.5 2.5 0 0122 9v10a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 19V9a2.5 2.5 0 012.5-2.5z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7.5 2.8h9A4.7 4.7 0 0121.2 7.5v9A4.7 4.7 0 0116.5 21.2h-9A4.7 4.7 0 012.8 16.5v-9A4.7 4.7 0 017.5 2.8z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M12 16.2A4.2 4.2 0 1012 7.8a4.2 4.2 0 000 8.4z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path d="M17.2 6.7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'facebook':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M14 8.7V7.3c0-1 .8-1.8 1.8-1.8H18V2.8h-2.2A4.6 4.6 0 0011 7.4v1.3H8.5v3H11v9h3v-9h3l.5-3H14z"
            fill="currentColor"
          />
        </svg>
      )
    case 'youtube':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21.5 8.6s-.2-1.7-.9-2.4c-.9-.9-1.8-.9-2.3-1C15 5 12 5 12 5h0s-3 0-6.3.2c-.5.1-1.4.1-2.3 1C2.7 7 2.5 8.6 2.5 8.6S2.3 10.5 2.3 12.4v1.2c0 1.9.2 3.8.2 3.8s.2 1.7.9 2.4c.9.9 2.2.9 2.7 1 2 .2 8.4.2 8.4.2s3 0 6.3-.2c.5-.1 1.4-.1 2.3-1 .7-.7.9-2.4.9-2.4s.2-1.9.2-3.8v-1.2c0-1.9-.2-3.8-.2-3.8z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path d="M10.4 10.3l5 2.9-5 2.9v-5.8z" fill="currentColor" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6.4 9.2H3.6v11.3h2.8V9.2zM5 3.5a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2z"
            fill="currentColor"
          />
          <path
            d="M10 9.2h2.7v1.5h.1c.4-.8 1.5-1.7 3.2-1.7 2.9 0 3.4 1.9 3.4 4.3v7.2h-2.8v-6.4c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3v6.5H10V9.2z"
            fill="currentColor"
          />
        </svg>
      )
    default:
      return null
  }
}

export default function ViviFooter({ galleryImages = [], showBackToTop = true }) {
  return (
    <>
      <footer className="pt-5 mt-5 text-white-50">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden" style={{ background: '#103741' }}>
            <div className="px-4 py-10 sm:px-6">
              <div className="grid gap-10 lg:grid-cols-4">
                <div className="lg:pr-4">
                  <h3 className="vivi-heading mb-4 text-2xl text-white">Get In Touch</h3>
                  <p className="mb-2 flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-0.5 text-white/70"><Icon name="map" /></span>
                    <span>{SCHOOL_PROFILE.contact.address}</span>
                  </p>
                  <p className="mb-2 flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-0.5 text-white/70"><Icon name="phone" /></span>
                    <span>{SCHOOL_PROFILE.contact.phone}</span>
                  </p>
                  <p className="mb-2 flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-0.5 text-white/70"><Icon name="mail" /></span>
                    <span>{SCHOOL_PROFILE.contact.email}</span>
                  </p>

                  <div className="mt-4 flex gap-3">
                    <a
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:bg-white/10"
                      href="https://www.instagram.com/anvilcodingschool"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      title="Instagram"
                    >
                      <Icon name="instagram" />
                    </a>
                    <a
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:bg-white/10"
                      href="#"
                      aria-label="Facebook"
                      title="Facebook"
                    >
                      <Icon name="facebook" />
                    </a>
                    <a
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:bg-white/10"
                      href="#"
                      aria-label="YouTube"
                      title="YouTube"
                    >
                      <Icon name="youtube" />
                    </a>
                    <a
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:bg-white/10"
                      href="#"
                      aria-label="LinkedIn"
                      title="LinkedIn"
                    >
                      <Icon name="linkedin" />
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="vivi-heading mb-4 text-2xl text-white">Quick Links</h3>
                  <div className="space-y-2 text-sm text-white/60">
                    {[
                      { to: '/about', label: 'About Us', type: 'link' },
                      { to: '/contact', label: 'Contact Us', type: 'link' },
                      { to: '#', label: 'Our Services', type: 'a' },
                      { to: '#', label: 'Privacy Policy', type: 'a' },
                      { to: '#', label: 'Terms & Condition', type: 'a' },
                    ].map((it) => {
                      const row = (
                        <>
                          <span className="mr-2 text-white/35">›</span>
                          <span>{it.label}</span>
                        </>
                      )
                      if (it.type === 'link') {
                        return (
                          <Link key={it.label} to={it.to} className="block hover:text-white">
                            {row}
                          </Link>
                        )
                      }
                      return (
                        <a key={it.label} href={it.to} className="block hover:text-white">
                          {row}
                        </a>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="vivi-heading mb-4 text-2xl text-white">Photo Gallery</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.slice(0, 6).map((src, idx) => (
                      <div key={idx} className="rounded bg-white/10 p-1">
                        <img src={src} alt="" className="h-20 w-full rounded object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="vivi-heading mb-4 text-2xl text-white">Newsletter</h3>
                  <p className="mb-4 text-sm text-white/60">Get updates about new courses and holiday bootcamps.</p>
                  <form
                    className="relative mx-auto"
                    onSubmit={(e) => {
                      e.preventDefault()
                      alert('Thanks for subscribing!')
                    }}
                  >
                    <input
                      className="w-full rounded-full border border-white/25 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                      placeholder="Your email"
                      type="email"
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 items-center justify-center rounded-full bg-[#FE5D37] px-6 text-sm font-bold text-white"
                    >
                      SignUp
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2 md:items-center">
                <div className="text-sm text-white/55">
                  © {SCHOOL_PROFILE.name}, All Right Reserved. Designed By Anvil Coding Academy School of Programming.
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-white/55 md:justify-end">
                  <Link to="/" className="hover:text-white">Home</Link>
                  <a href="#" className="hover:text-white">Cookies</a>
                  <a href="#" className="hover:text-white">Help</a>
                  <Link to="/faq" className="hover:text-white">FQAs</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:brightness-110"
          aria-label="Back to top"
          title="Back to top"
        >
          ↑
        </button>
      )}
    </>
  )
}

