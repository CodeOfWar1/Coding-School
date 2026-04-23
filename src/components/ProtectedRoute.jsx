import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600"
            aria-hidden
          />
          <p className="text-sm font-medium text-slate-600">Loading…</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles?.length && !allowedRoles.includes(profile?.role)) return <Navigate to="/dashboard" replace />
  return children
}
