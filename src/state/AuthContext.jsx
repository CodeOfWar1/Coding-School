/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isDemoMode, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const VALID_DEMO_ROLES = ['student', 'parent', 'finance', 'admin']

function normalizeDemoRole(role) {
  if (VALID_DEMO_ROLES.includes(role)) return role
  return 'student'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      const timer = setTimeout(() => {
        const role = normalizeDemoRole(localStorage.getItem('demo_role') || 'student')
        const email = localStorage.getItem('demo_email') || 'demo@local.dev'
        setSession({ user: { id: `demo-${role}`, email } })
        setProfile({ id: `demo-${role}`, full_name: 'Demo User', role })
        setLoading(false)
      }, 0)
      return () => clearTimeout(timer)
    }

    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const s = data.session
      setSession(s)
      if (s?.user?.id) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle()
        setProfile(p ?? null)
      }
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      if (s?.user?.id) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle()
        setProfile(p ?? null)
      } else {
        setProfile(null)
      }
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = ({ email, role }) => {
    const r = normalizeDemoRole(role)
    localStorage.setItem('demo_role', r)
    localStorage.setItem('demo_email', email)
    setSession({ user: { id: `demo-${r}`, email } })
    setProfile({ id: `demo-${r}`, full_name: 'Demo User', role: r })
  }
  const logout = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demo_role')
      localStorage.removeItem('demo_email')
      setSession(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }

  const value = useMemo(
    () => ({ user: session?.user ?? null, session, profile, loading, login, logout, isDemoMode }),
    [session, profile, loading],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
