import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Public site navigation — Mandakh Coding School branding, aligned with dashboard theme.
 * @param {{ variant?: 'hero' | 'light', onRegisterPay?: () => void, sticky?: boolean, showRegisterPay?: boolean }} props
 */
export default function SiteNavbar({
  variant = 'hero',
  onRegisterPay,
  sticky = true,
  showRegisterPay = true,
}) {
  const [infoOpen, setInfoOpen] = useState(false)
  const infoRef = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (!infoOpen) return
      if (!infoRef.current) return
      if (infoRef.current.contains(e.target)) return
      setInfoOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setInfoOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [infoOpen])

  const navItemCls =
    variant === 'light'
      ? 'vivi-nav-link hover:bg-white/10'
      : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'

  const dropdownShellCls =
    variant === 'light'
      ? 'border-[color:color-mix(in_srgb,var(--anvil-cyan)_34%,white)] bg-white shadow-lg'
      : 'bg-slate-950/55 border-white/15 shadow-xl'

  const stickyCls = sticky ? 'sticky top-0 z-50' : ''
  const shell =
    variant === 'light'
      ? `${stickyCls} bg-transparent`
      : `${stickyCls} bg-slate-950/45 backdrop-blur-xl`

  return (
    <header className={shell}>
      <div className="mx-auto w-full max-w-7xl px-0 py-0">
        <div
          className={`flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 ${
            variant === 'light'
              ? 'vivi-nav backdrop-blur-md'
              : 'bg-slate-950/45 backdrop-blur-xl'
          }`}
        >
        <Link to="/" className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-95">
          <div
            className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ${
              variant === 'light' ? 'bg-white/95 ring-[color:color-mix(in_srgb,var(--anvil-cyan)_35%,white)]' : 'bg-white/10 ring-white/20'
            }`}
          >
            <img
              src="/main%20logo/anvil-logo.png"
              alt="Anvil logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-wide ${variant === 'light' ? 'text-white/75' : 'text-white/75'}`}>
              Anvil
            </p>
            <p
              className={`truncate text-lg font-extrabold tracking-tight ${
                variant === 'light' ? 'text-white' : 'text-white'
              }`}
            >
              Coding Academy
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              navItemCls
            }`}
          >
            Home
          </Link>

          <div ref={infoRef} className="relative">
            <button
              type="button"
              aria-label="Open info menu"
              aria-haspopup="menu"
              aria-expanded={infoOpen}
              onClick={() => setInfoOpen((v) => !v)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${navItemCls}`}
            >
              Pages
            </button>
            {infoOpen && (
              <div
                role="menu"
                className={`absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border ${dropdownShellCls}`}
              >
                <div className="p-2">
                  {[
                    { to: '/about', label: 'About Us' },
                    { to: '/partners', label: 'Partners' },
                    { to: '/programs', label: 'Classes' },
                    { to: '/faq', label: 'FAQ' },
                    { to: '/newsletter', label: 'Newsletter' },
                  ].map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      role="menuitem"
                      onClick={() => setInfoOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        variant === 'light'
                          ? 'text-slate-800 hover:bg-slate-100'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link
            to="/login"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${navItemCls}`}
          >
            Login
          </Link>

          {showRegisterPay && onRegisterPay && (
            <button
              type="button"
              onClick={onRegisterPay}
              className={`btn-theme-primary px-4 py-2 text-sm shadow-md ${
                variant === 'light'
                  ? 'text-white'
                  : 'bg-white text-sky-900 hover:bg-white/95'
              }`}
            >
              Register
            </button>
          )}
          <a
            href="/#appointment"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${navItemCls}`}
          >
            Book an Appointment
          </a>
        </nav>
        </div>
      </div>
    </header>
  )
}
