import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './state/AuthContext'

import LoginPage from './views/LoginPage'
import ViviLandingPage from './views/ViviLandingPage'
import StudentDashboard from './views/StudentDashboard'
import ParentDashboard from './views/ParentDashboard'
import AdminDashboard from './views/AdminDashboard'
import Gallery from './views/Gallery'
import AboutPage from './views/AboutPage'
import DashboardRedirect from './views/DashboardRedirect'

function RouteGuard({ children, allowedRoles = [] }) {
  const { user, profile, authLoading, profileLoading } = useAuth()

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#faa853] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verify Email
      </div>
    )
  }

  if (!profile) return <div>Profile missing</div>

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(profile.role)
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const { authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#faa853] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<ViviLandingPage />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/dashboard/student"
        element={
          <RouteGuard allowedRoles={['student']}>
            <StudentDashboard />
          </RouteGuard>
        }
      />

      <Route
        path="/dashboard/parent"
        element={
          <RouteGuard allowedRoles={['parent']}>
            <ParentDashboard />
          </RouteGuard>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <RouteGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </RouteGuard>
        }
      />

      {/* SINGLE REDIRECT ENTRY POINT */}
      <Route
        path="/dashboard"
        element={<DashboardRedirect />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}