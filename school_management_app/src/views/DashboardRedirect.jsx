import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function DashboardRedirect() {
  const { profile, authLoading, profileLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading || profileLoading) return
    if (!profile?.role) return

    if (profile.role === 'student') {
      navigate('/dashboard/student', { replace: true })
    } else if (profile.role === 'parent') {
      navigate('/dashboard/parent', { replace: true })
    } else if (profile.role === 'finance') {
      navigate('/dashboard/finance', { replace: true })
    } else if (profile.role === 'admin') {
      navigate('/dashboard/admin', { replace: true })
    } else if (profile.role === 'teacher') {
      navigate('/dashboard/teacher', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [profile, authLoading, profileLoading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#faa853] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}