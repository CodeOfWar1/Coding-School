import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { isDemoMode, supabase } from '../lib/supabase'
import SiteNavbar from '../components/SiteNavbar'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('demo@school.local')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (isDemoMode) {
      login({ email, role })
      navigate('/dashboard')
      return
    }
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) return setError(signInError.message)
      navigate('/dashboard')
    } catch {
      setError('Unable to reach Supabase.')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--app-auth-gradient)' }}>
      <SiteNavbar variant="light" sticky showRegisterPay={false} />

      <div className="flex items-center justify-center px-4 pb-16 pt-8">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60"
        >
          <h1 className="text-center text-3xl font-black tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Access your Mandakh portal. After signing in, use <strong>Register + Pay</strong> on the home page or the
            full registration screen.
          </p>
          {isDemoMode && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Demo mode: pick a role to preview dashboards — no password check.
            </p>
          )}
          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-sky-500/25 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          {!isDemoMode && (
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-sky-500/25 focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </label>
          )}
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Role (demo preview)
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-sky-500/25 focus:ring-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="finance">Finance</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </label>
          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          )}
          <button
            type="submit"
            className="mt-6 w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, var(--app-brand) 0%, #4f46e5 100%)' }}
          >
            Sign in
          </button>
          <p className="mt-6 text-center text-sm text-slate-600">
            <Link
              to="/"
              className="font-semibold text-[var(--app-brand)] hover:text-[var(--app-brand-hover)] hover:underline"
            >
              ← Back to home
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
