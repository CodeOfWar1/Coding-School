import { useEffect, useMemo, useState } from 'react'
import {
  FaArrowLeft,
  FaSpinner,
  FaUsers,
  FaClipboardList,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import ClassStudentsList from './ClassStudentList'
import AssignmentsTab from './AssignmentTab'
import { classDisplayName } from '../../hooks/useTeacherDashboard'

const TABS = [
  { key: 'students', label: 'Students', icon: <FaUsers /> },
  { key: 'assignments', label: 'Assignments', icon: <FaClipboardList /> },
]

export default function TeacherClassDetail({ classInfo, onBack }) {
  const [tab, setTab] = useState('students')
  const [loading, setLoading] = useState(true)

  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    loadAll()
  }, [classInfo.id])

  async function loadAll() {
    setLoading(true)
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        supabase
          .from('class_students')
          .select(`
            id,
            student_user_id,
            profile:student_user_id (
              id, first_name, last_name, full_name, email, phone, avatar_url,
              parent_id
            )
          `)
          .eq('class_id', classInfo.id),
        supabase
          .from('coding_tasks')
          .select('*')
          .eq('class_id', classInfo.id)
          .order('created_at', { ascending: false }),
      ])

      if (studentsRes.error) throw studentsRes.error
      if (assignmentsRes.error) throw assignmentsRes.error

      setStudents(studentsRes.data || [])
      setAssignments(assignmentsRes.data || [])
    } catch (e) {
      console.error('Failed to load class detail:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[#2d3f5d]">
              {classDisplayName(classInfo)}
            </h2>
            <p className="text-sm text-gray-500">
              {students.length} student{students.length === 1 ? '' : 's'}
              {classInfo.description ? ` · ${classInfo.description}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-[#faa853] text-[#faa853]'
                : 'border-transparent text-gray-500 hover:text-[#2d3f5d]'
            }`}
          >
            <span className="text-xs">{t.icon}</span>
            {t.label}
            <span className="ml-1 text-xs text-gray-400">
              {t.key === 'students' && `(${students.length})`}
              {t.key === 'assignments' && `(${assignments.length})`}
            </span>
          </button>
        ))}
      </div>

      {tab === 'students' && <ClassStudentsList students={students} />}

      {tab === 'assignments' && (
        <AssignmentsTab
          classId={classInfo.id}
          assignments={assignments}
          reload={loadAll}
        />
      )}
    </div>
  )
}