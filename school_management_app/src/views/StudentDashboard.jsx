import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { supabase } from '../lib/supabase'
import StudentOverview from '../components/Students/StudentOverview'
import StudentEnrollments from '../components/Students/StudentEnrollments'
import StudentAssignments from '../components/Students/StudentAssignments'
import StudentGrades from '../components/Students/StudentGrades'
import StudentSchedules from '../components/Students/StudentSchedules'
import { useNavigate } from 'react-router-dom'
import {
  FaHome,
  FaBook,
  FaCode,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaCheck,
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa'

const NAV_ITEMS = [
  { id: 'overview', label: 'Home', icon: <FaHome className="text-lg" /> },
  { id: 'classes', label: 'My Enrollments', icon: <FaBook className="text-lg" /> },
  { id: 'assignments', label: 'Assignments', icon: <FaCode className="text-lg" /> },
  {id: "grades", label: "My Grades", icon: <FaCheck className="text-lg" /> },
  { id: 'schedules', label: 'Schedules', icon: <FaCalendarAlt className="text-lg" /> },
]

export default function StudentDashboard() {
  const { user, profile, signOut } = useAuth()

  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studentRecord, setStudentRecord] = useState(null)
  const [enrollments, setEnrollments] = useState([])

  const isStudent = Boolean(studentRecord)

  const loadDashboard = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      // 1) student record for this user
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('id, student_id, admitted_date')
        .eq('student_id', user.id)
        .maybeSingle()
      if (sErr) throw sErr

      if (!student) {
        setStudentRecord(null)
        setEnrollments([])
        return
      }

      // 2) enrollments + course info
      const { data: rows, error: eErr } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          enrolled_date,
          status,
          course:course_id (
            id, course_name, course_code, tuition_fee, description
          )
        `)
        .eq('student_id', student.id)
        .order('enrolled_date', { ascending: false })
      if (eErr) throw eErr

      setStudentRecord(student)
      setEnrollments(rows || [])
    } catch (e) {
      console.error('Failed to load student dashboard:', e)
      setError(e.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const displayName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Student'

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'S'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#faa853] animate-spin mx-auto mb-4" />
          <p className="text-[#2d3f5d]">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
          <p className="text-red-800 text-lg font-semibold">
            Error loading dashboard
          </p>
          <p className="text-red-600 mt-2 text-sm">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try again
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
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
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
                  onClick={() => navigate('/dashboard/student/profile')}
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
                <p className="text-xs text-gray-500">
                  {isStudent ? 'Student' : 'Pending enrollment'}
                </p>
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
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold text-[#2d3f5d] md:text-2xl">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="p-4 md:p-6">
            {activeSection === 'overview' && (
              <StudentOverview
                profile={profile}
                isStudent={isStudent}
                studentRecord={studentRecord}
                studentId={user?.id}
                onGoToAssignments={() => setActiveSection('assignments')}
                onGoToSchedules={() => setActiveSection('schedules')}
              />
            )}

            {activeSection === 'classes' &&
              (isStudent ? (
                <StudentEnrollments
                  enrollments={enrollments}
                />
              ) : (
                <NotEnrolled
                  icon={<FaBook className="text-4xl text-blue-500 mx-auto mb-3" />}
                  message="You're not enrolled in a class yet."
                  detail="Your parent manages applications. Once you're enrolled, your classes will appear here."
                />
              ))}

            {activeSection === 'assignments' &&
              (isStudent ? (
                <StudentAssignments studentId={user?.id} />
              ) : (
                <NotEnrolled
                  icon={<FaCode className="text-4xl text-blue-500 mx-auto mb-3" />}
                  message="You're not enrolled in a class yet."
                  detail="Once you're enrolled, your assignments will appear here."
                />
              ))}

              {activeSection === 'grades' &&
              (isStudent ? (
                <StudentGrades studentId={user?.id} />
              ) : (
                <NotEnrolled
                  icon={<FaClipboardCheck className="text-4xl text-blue-500 mx-auto mb-3" />}
                  message="You're not enrolled in a class yet."
                  detail="Once you're enrolled and graded, your grades will appear here."
                />
              ))}

              {activeSection === 'schedules' &&
              (isStudent ? (
                <StudentSchedules studentId={user?.id} />
              ) : (
                <NotEnrolled
                  icon={<FaCalendarAlt className="text-4xl text-blue-500 mx-auto mb-3" />}
                  message="You're not enrolled in a class yet."
                  detail="Once you're enrolled, your class schedules will appear here."
                />
              ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function NotEnrolled({ icon, message, detail }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
      {icon}
      <p className="text-blue-800 font-medium">{message}</p>
      {detail && (
        <p className="text-blue-700 text-sm mt-2 max-w-md mx-auto">{detail}</p>
      )}
    </div>
  )
}