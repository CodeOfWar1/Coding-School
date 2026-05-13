import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { createDevGuestAuth, devGuestRoleFromPath } from '../lib/devGuestAuth'

const AuthContext = createContext(null)

async function fetchProfileRow(userId) {
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

export function AuthProvider({ children }) {
  const { pathname } = useLocation()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const [authLoading, setAuthLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const resolveAuthState = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const realUser = session?.user ?? null

    if (realUser) {
      setUser(realUser)
      setIsDemoMode(false)
      setProfileLoading(true)
      const p = await fetchProfileRow(realUser.id)
      setProfile(p)
      setProfileLoading(false)
      setAuthLoading(false)
      return
    }

    if (import.meta.env.DEV) {
      const role = devGuestRoleFromPath(window.location.pathname)
      if (role) {
        const guest = createDevGuestAuth(role)
        if (guest) {
          setUser(guest.user)
          setProfile(guest.profile)
          setIsDemoMode(guest.isDemoMode)
          setProfileLoading(false)
          setAuthLoading(false)
          return
        }
      }
    }

    setUser(null)
    setProfile(null)
    setIsDemoMode(false)
    setProfileLoading(false)
    setAuthLoading(false)
  }, [])

  useEffect(() => {
    let alive = true

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (!alive) return
      void resolveAuthState()
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [resolveAuthState])

  useEffect(() => {
    void resolveAuthState()
  }, [pathname, resolveAuthState])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsDemoMode(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isDemoMode,
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
