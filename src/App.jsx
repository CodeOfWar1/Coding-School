import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './state/AuthContext.jsx'
import LoginPage from './views/LoginPage.jsx'
import ViviLandingPage from './views/ViviLandingPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RegisterPaymentPage from './views/RegisterPaymentPage.jsx'
import StudentDashboard from './views/StudentDashboard.jsx'
import ParentDashboard from './views/ParentDashboard.jsx'
import FinanceDashboard from './views/FinanceDashboard.jsx'
import AdminDashboard from './views/AdminDashboard.jsx'
import ProgramsPage from './views/ProgramsPage.jsx'
import AboutPage from './views/AboutPage.jsx'
import BlogPage from './views/BlogPage.jsx'
import FAQPage from './views/FAQPage.jsx'
import ContactPage from './views/ContactPage.jsx'
import NewsletterPage from './views/NewsletterPage.jsx'
import GalleryPage from './views/GalleryPage.jsx'

const DASHBOARD_ROLES = ['student', 'parent', 'finance', 'admin']

function RoleHome() {
  const { profile } = useAuth()
  if (!profile?.role) return <Navigate to="/login" replace />
  if (!DASHBOARD_ROLES.includes(profile.role)) return <Navigate to="/login" replace />
  return <Navigate to={`/dashboard/${profile.role}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ViviLandingPage />} />
      <Route
        path="/login"
        element={<LoginPage />}
      />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/newsletter" element={<NewsletterPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/register"
        element={
          <ProtectedRoute>
            <RegisterPaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleHome />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/finance" element={<ProtectedRoute allowedRoles={['finance']}><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
