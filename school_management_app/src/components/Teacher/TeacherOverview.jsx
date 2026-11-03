import { useCallback, useEffect, useState } from 'react'
import {
  FaUserCheck,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaPen,
  FaArrowRight,
  FaSpinner,
  FaClipboardList,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

function toHref(location) {
  if (!location) return null
  const t = location.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  if (/^[^\s]+\.[^\s]{2,}(\/\S*)?$/i.test(t)) return `https://${t}`
  return null
}

export default function TeacherOverview({
  profile,
  onGoToClasses,
  onGoToSchedules,
  onGoToGrading,
}) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [upcomingSchedules, setUpcomingSchedules] = useState([])
  const [pendingGrades, setPendingGrades] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('not-signed-in')

      const { data: classTeachers, error: ctErr } = await supabase
        .from('class_teachers')
        .select('class_id, class:class_id (id, name)')
        .eq('teacher_id', user.id)
      if (ctErr) throw ctErr

      const myClasses = (classTeachers || []).map((r) => r.class).filter(Boolean)
      const classIds = myClasses.map((c) => c.id)

      if (classIds.length === 0) {
        setUpcomingSchedules([])
        setPendingGrades([])
        return
      }

      const nowIso = new Date().toISOString()

      const [schedRes, subsRes] = await Promise.all([
        supabase
          .from('class_schedules')
          .select(`
            id,
            class:class_id (id, name),
            schedule:schedule_id (id, title, start_at, end_at, location)
          `)
          .in('class_id', classIds),
        supabase
          .from('coding_submissions')
          .select(`
            id, status, submitted_at, task_id,
            task:task_id (
              id, title, points_max, class_id,
              class:class_id (id, name)
            ),
            student:student_id (
              id, full_name, first_name, last_name, email
            )
          `)
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false })
      ])

      if (schedRes.error) throw schedRes.error
      if (subsRes.error) throw subsRes.error

      const schedules = (schedRes.data || [])
        .map((r) => ({ ...r.schedule, klass: r.class }))
        .filter((s) => s.id && new Date(s.start_at).toISOString() >= nowIso)
        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
        .slice(0, 3)

      const pending = (subsRes.data || [])
        .filter((s) => s.task && classIds.includes(s.task.class_id))
        .slice(0, 3)

      setUpcomingSchedules(schedules)
      setPendingGrades(pending)
    } catch (e) {
      console.error('[TeacherOverview] load failed:', e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const firstName =
    profile?.first_name ||
    profile?.full_name?.split(' ')[0] ||
    'Teacher'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#faa853]/10 to-[#2d3f5d]/10 rounded-xl p-6 border border-[#faa853]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#faa853]/20 flex items-center justify-center">
            <FaUserCheck className="text-[#faa853] text-xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#2d3f5d] mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="text-[#2d3f5d]/70">
              Here's what's on your plate today.
            </p>
          </div>
          <button
            onClick={onGoToClasses}
            className="hidden md:inline-flex items-center gap-1 text-sm text-[#faa853] hover:underline"
          >
            My classes <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-[#faa853] text-2xl" />
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Could not load your overview.{' '}
          <button onClick={load} className="ml-1 underline">
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Upcoming schedules */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#2d3f5d] flex items-center gap-2">
                <FaCalendarAlt className="text-[#faa853]" />
                Upcoming schedules
              </h2>
              <button
                onClick={onGoToSchedules}
                className="text-sm text-[#faa853] hover:underline flex items-center gap-1"
              >
                View all <FaArrowRight className="text-xs" />
              </button>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500">
                No upcoming schedules. Create one from the Schedules tab.
              </div>
            ) : (
              <ul className="space-y-2">
                {upcomingSchedules.map((s) => {
                  const href = toHref(s.location)
                  return (
                    <li
                      key={`${s.id}-${s.klass?.id}`}
                      className="bg-white border border-gray-200 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[#2d3f5d] truncate">
                            {s.title}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaClock />
                              {new Date(s.start_at).toLocaleString()}
                            </span>
                            {s.location && (
                              href ? (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[#faa853] hover:underline"
                                >
                                  <FaMapMarkerAlt />
                                  {s.location}
                                  <FaExternalLinkAlt className="text-[10px] opacity-70" />
                                </a>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <FaMapMarkerAlt /> {s.location}
                                </span>
                              )
                            )}
                            {s.klass?.name && (
                              <span className="px-2 py-0.5 rounded bg-[#faa853]/10 text-[#2d3f5d]">
                                {s.klass.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Pending grades */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#2d3f5d] flex items-center gap-2">
                <FaPen className="text-[#faa853]" />
                Awaiting your grade
              </h2>
              <button
                onClick={onGoToGrading}
                className="text-sm text-[#faa853] hover:underline flex items-center gap-1"
              >
                Grade now <FaArrowRight className="text-xs" />
              </button>
            </div>

            {pendingGrades.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500">
                <FaClipboardList className="text-2xl text-gray-300 mx-auto mb-2" />
                All caught up. No submissions waiting to be graded.
              </div>
            ) : (
              <ul className="space-y-2">
                {pendingGrades.map((s) => {
                  const studentName =
                    s.student?.full_name ||
                    `${s.student?.first_name ?? ''} ${
                      s.student?.last_name ?? ''
                    }`.trim() ||
                    'Student'
                  return (
                    <li
                      key={s.id}
                      className="bg-white border border-gray-200 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[#2d3f5d] truncate">
                            {s.task?.title || 'Assignment'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {studentName} · {s.task?.class?.name || 'Class'}
                          </p>
                          {s.submitted_at && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <FaClock className="text-[10px]" />
                              Submitted{' '}
                              {new Date(s.submitted_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={onGoToGrading}
                          className="text-xs text-[#faa853] font-medium hover:underline shrink-0"
                        >
                          Grade
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}