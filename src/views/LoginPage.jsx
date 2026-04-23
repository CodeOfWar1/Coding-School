import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { isDemoMode, supabase } from '../lib/supabase'
import SiteNavbar from '../components/SiteNavbar'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    if (isDemoMode) {
      login({ email, role })
      navigate('/dashboard')
      setSubmitting(false)
      return
    }
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setSubmitting(false)
        return
      }
      const { data: profileData } = await supabase.from('profiles').select('role').eq('id', (await supabase.auth.getUser()).data.user?.id).maybeSingle()
      if (!profileData?.role) {
        setError('Account authenticated, but no role profile exists yet. Contact admin.')
        setSubmitting(false)
        return
      }
      navigate('/dashboard')
    } catch {
      setError('Unable to reach Supabase.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="vivi-page min-h-screen bg-[var(--vivi-light)]">
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />
      <div className="flex items-center justify-center px-4 pb-16 pt-8">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-xl bg-[var(--anvil-card-faint)] p-8"
        >
          <h1 className="vivi-heading text-center text-3xl tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Access your Anvil portal securely. Use your registered email and password.
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
          {isDemoMode && (
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
          )}
          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          )}
          <button
            type="submit"
            className="vivi-btn vivi-btn-primary mt-6 w-full rounded-full py-3.5 text-sm font-bold text-white shadow-lg"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
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
    </div>
  )
}
