import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function PublicOnlyRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return children
  if (!user) return children
  const rolePath = profile?.role ? `/dashboard/${profile.role}` : '/dashboard'
  return <Navigate to={rolePath} replace />
}
