import { useAuth } from '../state/AuthContext'

export default function DashboardLayout({ title, menuItems, children }) {
  const { profile, logout } = useAuth()
  const dark = profile?.role === 'admin' || profile?.role === 'finance'

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      <header className={`${dark ? 'bg-slate-800' : 'bg-white'} border-b`}>
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
              {profile?.role}
            </span>
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1500px] grid-cols-12 gap-5 p-4">
        <aside className={`col-span-12 rounded-lg p-3 lg:col-span-2 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="mb-3 flex items-center gap-2">
            <img src="/media/Logo.png" alt="School logo" className="h-8 w-8 rounded" />
            <p className="text-lg font-bold">Mandakh</p>
          </div>
          <ul className="space-y-2 text-sm">
            {menuItems.map((m) => (
              <li key={m} className="rounded bg-blue-600 px-3 py-2 text-white">
                {m}
              </li>
            ))}
          </ul>
        </aside>
        <section className="col-span-12 space-y-5 lg:col-span-10">{children}</section>
      </main>
    </div>
  )
}

