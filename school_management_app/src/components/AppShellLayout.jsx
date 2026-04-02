import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

/**
 * Shared “myschool” layout: blue top bar, dark sidebar, light main area.
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {{ id: string, label: string, badge?: number, active?: boolean, icon?: string }[]} props.navItems
 * @param {string} [props.activeNavId] — when set with onNavSelect, highlights this id (overrides item.active)
 * @param {(id: string) => void} [props.onNavSelect] — sidebar item click handler (also closes mobile drawer)
 * @param {string} [props.roleLabel]
 * @param {string} [props.pageTitle]
 * @param {string} [props.breadcrumbLast]
 * @param {number} [props.messageCount]
 * @param {() => void} [props.onMessagesClick] — opens Messages in the dashboard (sidebar section)
 */
export default function AppShellLayout({
  children,
  navItems,
  activeNavId,
  onNavSelect,
  roleLabel = 'User',
  pageTitle = 'Dashboard',
  breadcrumbLast,
  messageCount = 1,
  onMessagesClick,
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

  const crumb = breadcrumbLast ?? pageTitle
  const dashboardPath = profile?.role ? `/dashboard/${profile.role}` : '/dashboard'

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between px-3 text-white shadow md:px-4"
        style={{ backgroundColor: 'var(--app-brand)' }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded p-2 hover:bg-white/10 md:hidden"
            aria-label="Open menu"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/media/Logo.png" alt="" className="hidden h-8 w-8 rounded sm:block" />
          <span className="font-semibold tracking-tight">Mandakh</span>
        </div>
        <div className="hidden items-center gap-1 text-sm md:flex">
          <Link to="/" className="rounded px-3 py-1.5 hover:bg-white/10">
            Home
          </Link>
          <Link to={dashboardPath} className="rounded px-3 py-1.5 hover:bg-white/10">
            Dashboard
          </Link>
          <button
            type="button"
            className="rounded px-3 py-1.5 hover:bg-white/10"
            onClick={() => {
              setSidebarOpen(false)
              onMessagesClick?.()
            }}
          >
            Messages
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            className="relative rounded p-2 hover:bg-white/10"
            aria-label="Open messages"
            onClick={() => {
              setSidebarOpen(false)
              onMessagesClick?.()
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {messageCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-200 px-1 text-[10px] font-bold text-sky-950">
                {messageCount > 9 ? '9+' : messageCount}
              </span>
            )}
          </button>
          <div className="flex max-w-[160px] items-center gap-1 truncate rounded bg-white/10 px-2 py-1">
            <span className="truncate">{displayName}</span>
            <span className="shrink-0 text-white/80">▾</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`fixed bottom-0 left-0 z-40 w-56 transform border-r border-slate-700 bg-slate-800 text-white transition md:static md:z-0 md:flex md:translate-x-0 md:flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ top: '3.5rem' }}
        >
          <div className="border-b border-slate-700 p-4">
            <p className="text-lg font-bold tracking-tight">Mandakh</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Portal</p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--app-brand)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{displayName}</p>
                <p className="text-xs text-slate-400">{roleLabel}</p>
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
                      style={selected ? { backgroundColor: 'var(--app-brand)' } : undefined}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2.5 text-left transition ${
                        selected
                          ? 'font-semibold text-white shadow-md shadow-slate-900/30'
                          : 'text-slate-200 hover:bg-slate-700/80 hover:text-white'
                      }`}
                      onClick={() => {
                        onNavSelect?.(item.id)
                        setSidebarOpen(false)
                      }}
                    >
                      {item.icon && <span className="text-base opacity-90">{item.icon}</span>}
                      <span className="flex-1">{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="rounded-full bg-sky-300 px-2 py-0.5 text-[11px] font-bold text-sky-950">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="border-t border-slate-700 p-3">
            <Link to="/" className="block rounded px-2 py-2 text-slate-300 hover:text-white">
              ← Home
            </Link>
            <button
              type="button"
              className="mt-1 w-full rounded bg-slate-900 px-2 py-2 text-left text-sm hover:bg-black"
              onClick={() => logout()}
            >
              Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{pageTitle}</h1>
            <nav className="text-sm text-slate-500">
              <Link to="/" className="font-medium text-sky-700 hover:text-sky-900">
                Home
              </Link>
              <span className="mx-1">/</span>
              <span className="text-slate-700">{crumb}</span>
            </nav>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
