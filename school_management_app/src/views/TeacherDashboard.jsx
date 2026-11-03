import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { supabase } from '../lib/supabase'
import TeacherOverview from '../components/Teacher/TeacherOverview'
import TeacherClasses from '../components/Teacher/TeacherClasses'
import TeacherTasks from '../components/Teacher/TeacherTasks'
import TeacherSchedules from '../components/Teacher/Schedules'
import { useNavigate } from 'react-router-dom'
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
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <FaHome className="text-lg" /> },
  { id: 'classes', label: 'My Classes', icon: <FaBook className="text-lg" /> },
  { id: 'tasks', label: 'Assignments', icon: <FaClipboardList className="text-lg" /> },
  { id: 'schedules', label: 'Schedules', icon: <FaCalendarAlt className="text-lg" /> },
]

export default function TeacherDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dashboard-level data (shared across sections)
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingGrades: 0,
  })

  const teacherId = user?.id
  const profile = user?.profile

  const displayName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Teacher'

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'T'

  // ---- data fetching ----
  useEffect(() => {
    if (!teacherId) return
    loadDashboard()
  }, [teacherId])

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      // 1) classes assigned to this teacher
      const { data: classTeachers, error: ctErr } = await supabase
        .from('class_teachers')
        .select(`
          class_id,
          class:class_id (
            id, name, description, status, capacity, created_at
          )
        `)
        .eq('teacher_id', teacherId)
      if (ctErr) throw ctErr

      const teacherClasses = (classTeachers || [])
        .map((r) => r.class)
        .filter(Boolean)

      const classIds = teacherClasses.map((c) => c.id)

      // 2) counts + assignments + pending grades in parallel
      const [studentsRes, assignmentsRes] = await Promise.all([
        classIds.length
          ? supabase
              .from('class_students')
              .select('class_id')
              .in('class_id', classIds)
          : Promise.resolve({ data: [], error: null }),
        classIds.length
          ? supabase
              .from('coding_tasks')
              .select('id, class_id, published')
              .in('class_id', classIds)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (studentsRes.error) throw studentsRes.error
      if (assignmentsRes.error) throw assignmentsRes.error

      // student count per class
      const studentCountByClass = {}
      for (const row of studentsRes.data || []) {
        studentCountByClass[row.class_id] =
          (studentCountByClass[row.class_id] || 0) + 1
      }

      const enrichedClasses = teacherClasses.map((c) => ({
        ...c,
        studentCount: studentCountByClass[c.id] || 0,
      }))

      // assignments count
      const assignments = assignmentsRes.data || []

      // pending grades: submissions without a score
      // (assume a submissions table; if not, keep 0)
      let pendingGrades = 0
      if (assignments.length > 0) {
        const assignmentIds = assignments.map((a) => a.id)
        const { data: submissions, error: subErr } = await supabase
          .from('coding_submissions')
          .select('id, score')
          .in('task_id', assignmentIds)
          .is('score', null)
        if (!subErr) pendingGrades = (submissions || []).length
      }

      setClasses(enrichedClasses)
      setStats({
        totalClasses: enrichedClasses.length,
        totalStudents: enrichedClasses.reduce(
          (sum, c) => sum + c.studentCount,
          0,
        ),
        totalAssignments: assignments.length,
        pendingGrades,
      })

      // auto-select the first class for roster/tasks/grading views
      if (enrichedClasses.length > 0) {
        setSelectedClassId((prev) => prev ?? enrichedClasses[0].id)
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e)
      setError(e.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) || null,
    [classes, selectedClassId],
  )

  // ---- render ----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#faa853] animate-spin mx-auto mb-4" />
          <p className="text-[#2d3f5d]">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
          <p className="text-red-800 font-semibold">
            Could not load teacher dashboard
          </p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <button
            onClick={loadDashboard}
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
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden transition-colors"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#faa853] flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="font-semibold text-[#2d3f5d] hidden sm:inline">
                AnvilCodingAcademy
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              {/* Profile Icon - Clickable */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard/teacher/profile')}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] hover:bg-[#faa853]/20 transition-colors"
                  title="Go to Profile"
                >
                  <FaUser className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
                <p className="truncate text-sm font-medium text-[#2d3f5d]">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">Teacher</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 text-gray-500"
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
                      {item.id === 'grading' && stats.pendingGrades > 0 && (
                        <span className="ml-auto text-xs bg-[#2d3f5d] text-white px-2 py-0.5 rounded-full">
                          {stats.pendingGrades}
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

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold text-[#2d3f5d] md:text-2xl">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <div className="p-4 md:p-6">
            {activeSection === 'overview' && (
              <TeacherOverview
                profile={profile}
                onGoToClasses={() => setActiveSection('classes')}
                onGoToSchedules={() => setActiveSection('schedules')}
                onGoToGrading={() => setActiveSection('grading')}
              />
            )}

            {activeSection === 'classes' && <TeacherClasses />}

            {activeSection === 'tasks' && (
              <TeacherTasks
                classes={classes}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
                onChanged={loadDashboard}
              />
            )}

            {activeSection === 'grading' && (
              <TeacherGrading
                classes={classes}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
              />
            )}

            {activeSection === 'schedules' && <TeacherSchedules classes={classes} />}


          </div>
        </main>
      </div>
    </div>
  )
}