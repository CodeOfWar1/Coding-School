import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

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
  const { user, profile } = useAuth()
  void user
  void profile
  const signInLabel = 'Sign in'

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
      ? 'vivi-nav-link hover:bg-[var(--vivi-light)]'
      : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'

  const dropdownShellCls =
    variant === 'light'
      ? 'bg-white/95 border-slate-200/90 shadow-lg'
      : 'bg-slate-950/55 border-white/15 shadow-xl'

  const stickyCls = sticky ? 'sticky top-0 z-50' : ''
  const shell =
    variant === 'light'
      ? `${stickyCls} bg-transparent`
      : `${stickyCls} bg-slate-950/45 backdrop-blur-xl`

  return (
    <header className={shell}>
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
        <div
          className={`flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 shadow-sm sm:px-6 ${
            variant === 'light'
              ? 'vivi-nav bg-white/95 backdrop-blur-md'
              : 'bg-slate-950/45 backdrop-blur-xl'
          }`}
        >
        <Link to="/" className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-95">
          <div
            className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ${
              variant === 'light' ? 'bg-white ring-slate-200' : 'bg-white/10 ring-white/20'
            }`}
          >
            <img
              src="/Screenshot%202026-04-03%20164428.png"
              alt="Anvil logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-wide ${variant === 'light' ? 'text-[var(--vivi-primary)]' : 'text-white/75'}`}>
              Anvil
            </p>
            <p
              className={`truncate text-lg font-extrabold tracking-tight ${
                variant === 'light' ? 'text-slate-900' : 'text-white'
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
          <Link
            to="/about"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${navItemCls}`}
          >
            About Us
          </Link>
          <Link
            to="/programs"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${navItemCls}`}
          >
            Classes
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
                    { to: '/faq', label: 'FAQ' },
                    { to: '/contact', label: 'Contact Us' },
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
            to="/contact"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${navItemCls}`}
          >
            Contact Us
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
              Register + Pay
            </button>
          )}
          <Link
            to="/login"
            className={`btn-theme-secondary px-4 py-2 text-sm ${
              variant === 'light'
                ? 'text-[var(--vivi-dark)]'
                : 'border border-white/35 bg-white/5 text-white hover:bg-white/15'
            }`}
          >
            {signInLabel}
          </Link>
        </nav>
        </div>
      </div>
    </header>
  )
}
