import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import logoImage from '../assets/logo.png'

/**
 * Portal shell — visual language aligned with the public landing (navy, amber, cream/sky surfaces).
 */
export default function AppShellLayout({
  children,
  navItems,
  activeNavId,
  onNavSelect,
  roleLabel = 'User',
  pageTitle = 'Dashboard',
  breadcrumbLast: _breadcrumbLast,
}) {
  const { user, profile, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName = profile?.full_name ?? user?.email ?? 'User'
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="portal-page flex min-h-screen flex-col font-sans">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-primary/25 bg-gradient-to-r from-secondary to-[#1a2542] px-3 text-white shadow-md md:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10 md:hidden"
            aria-label="Open menu"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2 transition hover:opacity-90">
            <img src={logoImage} alt="" className="h-9 w-auto object-contain" />
            <span className="hidden font-heading text-lg font-black tracking-tight sm:inline">Anvil Coding Academy</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm md:gap-3">
          <span className="hidden max-w-[200px] truncate rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/95 md:inline">
            {displayName}
          </span>
          <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary shadow-sm">
            {roleLabel}
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`fixed bottom-0 left-0 z-40 w-60 transform border-r border-secondary/15 bg-gradient-to-b from-secondary via-[#263553] to-[#1a2542] text-white shadow-xl transition md:static md:z-0 md:flex md:w-56 md:translate-x-0 md:flex-col md:shadow-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ top: '3.5rem' }}
        >
          <div className="border-b border-white/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Portal</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#f28c38] text-sm font-black text-secondary shadow-lg ring-2 ring-white/25">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{displayName}</p>
                <p className="text-xs text-white/60">{roleLabel}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 text-sm">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const selected =
                  activeNavId != null ? activeNavId === item.id : Boolean(item.active)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                        selected
                          ? 'bg-white/15 font-semibold text-white shadow-inner ring-1 ring-primary/40'
                          : 'text-white/85 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => {
                        onNavSelect?.(item.id)
                        setSidebarOpen(false)
                      }}
                    >
                      {item.icon && <span className="text-base opacity-95">{item.icon}</span>}
                      <span className="flex-1">{item.label}</span>
                      {selected && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(250,168,83,0.9)]" />
                      )}
                      {item.badge != null && item.badge > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-secondary">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              className="btn-portal-outline w-full bg-transparent px-3 py-2.5 text-center text-sm font-bold shadow-none"
              onClick={() => logout()}
            >
              Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-secondary/40 backdrop-blur-[2px] md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-secondary/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Dashboard</p>
                <h1 className="font-heading text-2xl font-black tracking-tight text-secondary md:text-3xl">{pageTitle}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2" aria-label="Page context">
                <span className="rounded-full border border-secondary/20 bg-gradient-to-r from-[#f8fbff] to-[#fff8ef] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary shadow-sm ring-1 ring-secondary/10">
                  {roleLabel}
                </span>
              </div>
            </div>
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
