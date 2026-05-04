import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [authLoading, setAuthLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return null
    }

    return data
  }

  useEffect(() => {
    let alive = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      const u = session?.user ?? null

      if (!alive) return

      setUser(u)

      if (u) {
        setProfileLoading(true)
        const p = await fetchProfile(u.id)
        if (alive) setProfile(p)
        setProfileLoading(false)
      }

      setAuthLoading(false)
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null

        if (!alive) return

        setUser(u)

        if (u) {
          setProfileLoading(true)
          const p = await fetchProfile(u.id)
          if (alive) setProfile(p)
          setProfileLoading(false)
        } else {
          setProfile(null)
        }

        setAuthLoading(false)
      })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authLoading,
        profileLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}