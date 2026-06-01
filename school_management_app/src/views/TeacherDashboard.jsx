import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import TeacherOverview from '../components/Teacher/TeacherOverview'
import TeacherClasses from '../components/Teacher/TeacherClasses'
import TeacherRoster from '../components/Teacher/TeacherRoster'
import TeacherTasks from '../components/Teacher/TeacherTasks'
import TeacherGrading from '../components/Teacher/TeacherGrading'
import {
  FaHome,
  FaBook,
  FaUsers,
  FaClipboardList,
  FaPen,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <FaHome className="text-lg" /> },
  { id: 'classes', label: 'My Classes', icon: <FaBook className="text-lg" /> },
  { id: 'roster', label: 'Pupils', icon: <FaUsers className="text-lg" /> },
  { id: 'tasks', label: 'Assignments', icon: <FaClipboardList className="text-lg" /> },
  { id: 'grading', label: 'Grading', icon: <FaPen className="text-lg" /> },
]

export default function TeacherDashboard() {
  const { user, signOut } = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const profile = user?.profile
  const teacherId = user?.id

  const dashboard = useTeacherDashboard(teacherId)

  const displayName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Teacher'

  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (dashboard.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#faa853] animate-spin mx-auto mb-4" />
          <p className="text-[#2d3f5d]">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }

  if (dashboard.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
          <p className="text-red-800 font-semibold">Could not load teacher dashboard</p>
          <p className="text-red-600 text-sm mt-2">{dashboard.error}</p>
          <p className="text-gray-600 text-xs mt-4">
            Run <code className="bg-white px-1 rounded">supabase/classes_coding_assignments.sql</code>{' '}
            in Supabase if tables are missing.
          </p>
          <button
            type="button"
            onClick={() => dashboard.refreshAll()}
            className="mt-4 px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm hover:bg-[#e89235] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden transition-colors"
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
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-medium text-sm">
              {initials}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-[#2d3f5d]">{displayName}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-gray-100 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#2d3f5d]">{displayName}</p>
                <p className="text-xs text-gray-500">Teacher</p>
              </div>
              <button
                type="button"
                className="md:hidden p-2 text-gray-500"
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
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
                      {item.id === 'grading' && dashboard.stats.pendingGrades > 0 && (
                        <span className="ml-auto text-xs bg-[#2d3f5d] text-white px-2 py-0.5 rounded-full">
                          {dashboard.stats.pendingGrades}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="border-t border-gray-100 p-3 flex-shrink-0">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold text-[#2d3f5d] md:text-2xl">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <div className="p-4 md:p-6">
            {activeSection === 'overview' && (
              <TeacherOverview stats={dashboard.stats} onNavigate={setActiveSection} />
            )}
            {activeSection === 'classes' && (
              <TeacherClasses
                classes={dashboard.classes}
                onSelectClass={dashboard.setSelectedClassId}
                selectedClassId={dashboard.selectedClassId}
              />
            )}
            {activeSection === 'roster' && (
              <TeacherRoster
                classes={dashboard.classes}
                selectedClassId={dashboard.selectedClassId}
                setSelectedClassId={dashboard.setSelectedClassId}
                selectedClass={dashboard.selectedClass}
                pupils={dashboard.pupils}
              />
            )}
            {activeSection === 'tasks' && (
              <TeacherTasks
                classes={dashboard.classes}
                selectedClassId={dashboard.selectedClassId}
                setSelectedClassId={dashboard.setSelectedClassId}
                tasks={dashboard.tasks}
                createTask={dashboard.createTask}
                updateTask={dashboard.updateTask}
                deleteTask={dashboard.deleteTask}
              />
            )}
            {activeSection === 'grading' && (
              <TeacherGrading
                classes={dashboard.classes}
                selectedClassId={dashboard.selectedClassId}
                setSelectedClassId={dashboard.setSelectedClassId}
                submissions={dashboard.submissions}
                gradeSubmission={dashboard.gradeSubmission}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
