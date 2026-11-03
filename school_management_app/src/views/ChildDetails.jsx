import { useCallback, useEffect, useState } from 'react'
import {
  FaArrowLeft,
  FaSpinner,
  FaClipboardList,
  FaCalendarAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserGraduate,
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import ChildAssignmentsTab from './ChildAssignmentTab'
import ChildSchedulesTab from './ChildSchedulesTab'
import ChildGradesTab from './ChildGradesTab'
import ChildTeachersTab from './ChildTeacherTab'

const TABS = [
  {
    key: 'assignments',
    label: 'Assignments',
    icon: <FaClipboardList />,
  },
  {
    key: 'schedules',
    label: 'Schedules',
    icon: <FaCalendarAlt />,
  },
  {
    key: 'grades',
    label: 'Grades',
    icon: <FaGraduationCap />,
  },
  {
    key: 'teachers',
    label: 'Teachers',
    icon: <FaChalkboardTeacher />,
  },
]

export default function ChildDetail({ child, onBack }) {
  const [tab, setTab] = useState('assignments')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [assignments, setAssignments] = useState([])
  const [schedules, setSchedules] = useState([])
  const [teachers, setTeachers] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      // 1) student's classes
      const { data: classStudents, error: csErr } = await supabase
        .from('class_students')
        .select('class_id, class:class_id (id, name)')
        .eq('student_user_id', child.id)
      if (csErr) throw csErr

      console.log("oewjgooirre: ", classStudents);
      const myClasses = (classStudents || [])
        .map((r) => r.class)
        .filter(Boolean)
      const classIds = myClasses.map((c) => c.id)

      if (classIds.length === 0) {
        setAssignments([])
        setSchedules([])
        setTeachers([])
        return
      }

      // 2) tasks, submissions, schedules, teachers — parallel
      const [tasksRes, subsRes, schedRes, teachersRes] = await Promise.all([
        supabase
          .from('coding_tasks')
          .select(`
            id, title, class_id, assignment_type, points_max, pass_threshold, deadline,
            class:class_id (id, name)
          `)
          .in('class_id', classIds)
          .eq('published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('coding_submissions')
          .select('id, task_id, status, score, pass_fail, submitted_at')
          .eq('student_id', child.id),
        supabase
          .from('class_schedules')
          .select(`
            id,
            class:class_id (id, name),
            schedule:schedule_id (
              id, title, description, start_at, end_at, location, teacher_id,
              teacher:teacher_id (full_name, first_name, last_name, email)
            )
          `)
          .in('class_id', classIds),
        supabase
          .from('class_teachers')
          .select(`
            id,
            class:class_id (id, name),
            teacher:teacher_id (id, full_name, first_name, last_name, email, phone)
          `)
          .in('class_id', classIds),
      ])

      if (tasksRes.error) throw tasksRes.error
      if (subsRes.error) throw subsRes.error
      if (schedRes.error) throw schedRes.error
      if (teachersRes.error) throw teachersRes.error

      const subByTask = Object.fromEntries(
        (subsRes.data || []).map((s) => [s.task_id, s]),
      )

      const tasks = (tasksRes.data || []).map((t) => ({
        ...t,
        submission: subByTask[t.id] || null,
      }))

      const scheduleList = (schedRes.data || [])
        .map((r) => ({ ...r.schedule, klass: r.class }))
        .filter((s) => s.id)
        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))

      // Dedupe teachers across classes
      const teacherMap = new Map()
      for (const row of teachersRes.data || []) {
        if (!row.teacher?.id) continue
        if (!teacherMap.has(row.teacher.id)) {
          teacherMap.set(row.teacher.id, {
            ...row.teacher,
            classes: [],
          })
        }
        teacherMap.get(row.teacher.id).classes.push(row.class)
      }

      setAssignments(tasks)
      setSchedules(scheduleList)
      setTeachers([...teacherMap.values()])
    } catch (e) {
      console.error('[ChildDetail] load failed:', e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [child.id])

  useEffect(() => {
    load()
  }, [load])

  const displayName =
    child.full_name ||
    `${child.first_name ?? ''} ${child.last_name ?? ''}`.trim() ||
    'Student'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center shrink-0">
            <FaUserGraduate className="text-[#faa853]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Student</p>
            <h1 className="text-lg font-semibold text-[#2d3f5d] truncate">
              {displayName}
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'border-[#faa853] text-[#faa853]'
                : 'border-transparent text-gray-500 hover:text-[#2d3f5d]'
            }`}
          >
            <span className="text-xs">{t.icon}</span>
            {t.label}
            {!loading && t.key === 'assignments' && (
              <span className="text-xs text-gray-400">
                ({assignments.length})
              </span>
            )}
            {!loading && t.key === 'schedules' && (
              <span className="text-xs text-gray-400">
                ({schedules.length})
              </span>
            )}
            {!loading && t.key === 'teachers' && (
              <span className="text-xs text-gray-400">
                ({teachers.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Could not load {displayName}'s data.{' '}
          <button onClick={load} className="ml-1 underline">
            Try again
          </button>
        </div>
      ) : (
        <>
          {tab === 'assignments' && (
            <ChildAssignmentsTab assignments={assignments} />
          )}
          {tab === 'schedules' && (
            <ChildSchedulesTab schedules={schedules} />
          )}
          {tab === 'grades' && (
            <ChildGradesTab assignments={assignments} />
          )}
          {tab === 'teachers' && (
            <ChildTeachersTab teachers={teachers} />
          )}
        </>
      )}
    </div>
  )
}