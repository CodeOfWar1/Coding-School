import { useCallback, useEffect, useState } from 'react'
import {
  FaUserCheck,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaClipboardList,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaExternalLinkAlt,
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

export default function StudentOverview({
  profile,
  isStudent,
  studentRecord,
  studentId,
  onGoToAssignments,
  onGoToSchedules,
}) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [upcomingSchedules, setUpcomingSchedules] = useState([])
  const [recentAssignments, setRecentAssignments] = useState([])

  const load = useCallback(async () => {
    if (!studentId || !isStudent) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(false)
    try {
      // 1) student's classes
      const { data: classStudents, error: csErr } = await supabase
        .from('class_students')
        .select('class_id, class:class_id (id, name)')
        .eq('student_user_id', studentId)
      if (csErr) throw csErr

      const myClasses = (classStudents || []).map((r) => r.class).filter(Boolean)
      const classIds = myClasses.map((c) => c.id)

      if (classIds.length === 0) {
        setUpcomingSchedules([])
        setRecentAssignments([])
        return
      }

      const nowIso = new Date().toISOString()

      // 2) upcoming schedules + recent assignments + submissions (parallel)
      const [schedRes, tasksRes, subsRes] = await Promise.all([
        supabase
          .from('class_schedules')
          .select(`
            id,
            class:class_id (id, name),
            schedule:schedule_id (id, title, start_at, end_at, location)
          `)
          .in('class_id', classIds),
        supabase
          .from('coding_tasks')
          .select('id, title, deadline, points_max, pass_threshold, assignment_type, created_at')
          .in('class_id', classIds)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('coding_submissions')
          .select('id, task_id, status, score, pass_fail')
          .eq('student_id', studentId),
      ])

      if (schedRes.error) throw schedRes.error
      if (tasksRes.error) throw tasksRes.error
      if (subsRes.error) throw subsRes.error

      const schedules = (schedRes.data || [])
        .map((r) => ({ ...r.schedule, klass: r.class }))
        .filter((s) => s.id && new Date(s.start_at).toISOString() >= nowIso)
        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
        .slice(0, 3)

      const subByTask = Object.fromEntries(
        (subsRes.data || []).map((s) => [s.task_id, s]),
      )

      const assignments = (tasksRes.data || [])
        .slice(0, 3)
        .map((t) => ({ ...t, submission: subByTask[t.id] || null }))

      setUpcomingSchedules(schedules)
      setRecentAssignments(assignments)
    } catch (e) {
      console.error('[StudentOverview] load failed:', e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [studentId, isStudent])

  useEffect(() => {
    load()
  }, [load])

  const firstName =
    profile?.first_name ||
    profile?.full_name?.split(' ')[0] ||
    'Student'

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
              {isStudent && studentRecord?.admitted_date
                ? `Student since ${new Date(
                    studentRecord.admitted_date,
                  ).toLocaleDateString()}`
                : 'Here is your latest work.'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-[#faa853] text-2xl" />
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Could not load your recent activity.{' '}
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
                No upcoming schedules.
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

          {/* Recent assignments */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#2d3f5d] flex items-center gap-2">
                <FaClipboardList className="text-[#faa853]" />
                Recent assignments
              </h2>
              <button
                onClick={onGoToAssignments}
                className="text-sm text-[#faa853] hover:underline flex items-center gap-1"
              >
                View all <FaArrowRight className="text-xs" />
              </button>
            </div>

            {recentAssignments.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500">
                No assignments yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {recentAssignments.map((t) => {
                  const sub = t.submission
                  return (
                    <li
                      key={t.id}
                      className="bg-white border border-gray-200 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[#2d3f5d] truncate">
                            {t.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {t.assignment_type === 'reading'
                              ? 'Reading'
                              : 'Coding'}{' '}
                            · {t.points_max} pts
                            {t.deadline &&
                              ` · due ${new Date(
                                t.deadline,
                              ).toLocaleDateString()}`}
                          </p>
                        </div>
                        <AssignmentBadge
                          submission={sub}
                          task={t}
                        />
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

function AssignmentBadge({ submission, task }) {
  if (!submission) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
        Not started
      </span>
    )
  }
  if (submission.status === 'graded') {
    const passed = submission.pass_fail === 'pass'
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded shrink-0 inline-flex items-center gap-1 ${
          passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {passed ? <FaCheckCircle /> : <FaTimesCircle />}
        {submission.score}/{task.points_max}
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0 inline-flex items-center gap-1">
      <FaHourglassHalf /> Submitted
    </span>
  )
}