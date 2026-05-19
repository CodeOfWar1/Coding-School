import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import { useStudentDashboard } from '../hooks/useStudentDashboard'
import StudentOverview from '../components/Students/StudentOverview'
import StudentApplicationManager from '../components/Students/StudentApplicationManager'
import StudentEnrollments from '../components/Students/StudentEnrollments'
import { 
  FaHome, 
  FaFileAlt, 
  FaBook, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <FaHome className="text-lg" /> },
  { id: 'applications', label: 'Applications', icon: <FaFileAlt className="text-lg" /> },
  { id: 'classes', label: 'My Classes', icon: <FaBook className="text-lg" /> },
]

export default function StudentDashboard() {
  const { user, profile, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  
// Change this line in the destructuring:
const {
  studentRecord,
  applications,
  enrollments,  // Changed from 'classes' to 'enrollments'
  courses,
  isLoading,
  isStudent,
  error,
  refreshData,
  deleteApplication,
  createNewApplication,
  updateApplicationProgress
} = useStudentDashboard(user?.id)
  
  const showToast = (message, type = 'success') => {
    setToast({ type, text: message })
    setTimeout(() => setToast(null), 3000)
  }
  
  const displayName = profile?.full_name || profile?.first_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#faa853] animate-spin mx-auto mb-4" />
          <p className="text-[#2d3f5d]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
          <p className="text-red-800 text-lg font-semibold">Error loading dashboard</p>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={() => refreshData()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Header - Fixed */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#faa853] flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="font-semibold text-[#2d3f5d]">AnvilCodingAcademy</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-medium text-sm">
                {initials}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-[#2d3f5d]">{displayName}</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed height, independent scroll */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* User Info */}
          <div className="border-b border-gray-100 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#2d3f5d]">{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{isStudent ? 'Student' : 'Applicant'}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-[#faa853]/10 text-[#faa853] font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#2d3f5d]'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
          
          {/* Sign Out Button - Fixed at bottom */}
          <div className="border-t border-gray-100 p-3 flex-shrink-0">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {/* Page Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold text-[#2d3f5d] md:text-2xl">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>
          
          {/* Page Content */}
          <div className="p-4 md:p-6">
            {toast && (
              <div className={`mb-4 p-4 rounded-lg border ${
                toast.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {toast.type === 'success' ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaExclamationTriangle className="text-red-600" />
                  )}
                  {toast.text}
                </div>
              </div>
            )}
            
            {activeSection === 'overview' && (
              <StudentOverview
                profile={profile}
                isStudent={isStudent}
                studentRecord={studentRecord}
                applications={applications}
                enrollments={enrollments || []}
                courses={courses}
                onCreateApplication={() => setActiveSection('applications')}
              />
            )}
            
            {activeSection === 'applications' && (
              <StudentApplicationManager
                applications={applications || []}
                courses={courses || []}
                isStudent={isStudent}
                onCreateNew={createNewApplication}
                onDelete={deleteApplication}
                onUpdateProgress={updateApplicationProgress}
                onSuccess={refreshData}
                showToast={showToast}
              />
            )}
            
            {activeSection === 'classes' && isStudent && (
              <StudentEnrollments
                enrollments={enrollments || []}
                studentRecord={studentRecord}
              />
            )}
            
            {activeSection === 'classes' && !isStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                <FaBook className="text-4xl text-blue-500 mx-auto mb-3" />
                <p className="text-blue-800">Complete your application to access classes.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}