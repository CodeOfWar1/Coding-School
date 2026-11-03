import { useEffect, useMemo, useState } from 'react'
import {
  FaArrowLeft, FaSpinner, FaUsers, FaBook, FaChalkboardTeacher,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import StatusBadge from './StatusBadge'
import StudentsTab from './StudentTab'
import CoursesTab from './CourseTab'
import TeachersTab from './TeachersTab'

const TABS = [
  { key: 'students', label: 'Students', icon: <FaUsers /> },
  { key: 'courses', label: 'Courses', icon: <FaBook /> },
  { key: 'teachers', label: 'Teachers', icon: <FaChalkboardTeacher /> },
]

export default function ClassDetail({ classId, onBack }) {
  const [tab, setTab] = useState('students')
  const [loading, setLoading] = useState(true)

  const [klass, setKlass] = useState(null)
  const [classCourses, setClassCourses] = useState([])
  const [classTeachers, setClassTeachers] = useState([])
  const [classStudents, setClassStudents] = useState([])

  const [allCourses, setAllCourses] = useState([])
  const [allTeachers, setAllTeachers] = useState([])

  useEffect(() => { loadAll() }, [classId])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [klassRes, ccRes, ctRes, csRes, coursesRes, teachersRes] = await Promise.all([
        supabase.from('classes').select('*').eq('id', classId).single(),
        supabase.from('class_courses').select(`
          *,
          course:course_id ( id, course_name, course_code, tuition_fee )
        `).eq('class_id', classId),
        supabase.from('class_teachers').select(`
          *,
          teacher:teacher_id ( id, first_name, last_name, full_name, email, avatar_url )
        `).eq('class_id', classId),
        supabase.from('class_students').select(`
          *,
          profile:student_user_id (
            id, email, first_name, last_name, full_name, phone, avatar_url, role
          )
        `).eq('class_id', classId),
        supabase.from('courses').select('id, course_name, course_code, tuition_fee').order('course_name'),
        supabase.from('profiles').select('id, first_name, last_name, full_name, email, avatar_url').eq('role', 'teacher').order('full_name'),
      ])

      if (klassRes.error) throw klassRes.error
      if (ccRes.error) throw ccRes.error
      if (ctRes.error) throw ctRes.error
      if (csRes.error) throw csRes.error
      if (coursesRes.error) throw coursesRes.error
      if (teachersRes.error) throw teachersRes.error

      setKlass(klassRes.data)
      setClassCourses(ccRes.data || [])
      setClassTeachers(ctRes.data || [])
      setClassStudents(csRes.data || [])
      setAllCourses(coursesRes.data || [])
      setAllTeachers(teachersRes.data || [])
    } catch (e) {
      console.error('Error loading class detail:', e)
    } finally {
      setLoading(false)
    }
  }

  const courseIds = useMemo(
    () => classCourses.map(cc => cc.course_id),
    [classCourses]
  )

  if (loading || !klass) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <FaArrowLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#2d3f5d]">{klass.name}</h2>
              <StatusBadge status={klass.status} />
            </div>
            {klass.capacity ? (
              <p className="text-sm text-gray-500">
                {classStudents.length} of {klass.capacity} students
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {classStudents.length} students
              </p>
            )}
          </div>
        </div>
      </div>

      {klass.description && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
          {klass.description}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(t => (
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
              {t.key === 'students' && `(${classStudents.length})`}
              {t.key === 'courses' && `(${classCourses.length})`}
              {t.key === 'teachers' && `(${classTeachers.length})`}
            </span>
          </button>
        ))}
      </div>

      {tab === 'students' && (
        <StudentsTab
          classId={classId}
          classStudents={classStudents}
          classCourses={classCourses}
          reload={loadAll}
        />
      )}

      {tab === 'courses' && (
        <CoursesTab
          classId={classId}
          classCourses={classCourses}
          allCourses={allCourses}
          courseIds={courseIds}
          reload={loadAll}
        />
      )}

      {tab === 'teachers' && (
        <TeachersTab
          classId={classId}
          classTeachers={classTeachers}
          allTeachers={allTeachers}
          reload={loadAll}
        />
      )}
    </div>
  )
}