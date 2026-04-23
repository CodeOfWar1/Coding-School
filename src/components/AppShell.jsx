import { useAuth } from '../state/AuthContext'

export default function AppShell({ title, children }) {
  const { profile, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">Coding School Portal</p>
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded bg-indigo-100 px-2 py-1 font-semibold text-indigo-700">{profile?.role}</span>
            <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  )
}
