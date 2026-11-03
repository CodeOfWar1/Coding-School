import { useEffect, useState } from 'react'
import {
  FaBook,
  FaUsers,
  FaChevronRight,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import TeacherClassDetail from './TeacherClassDetails'

export default function TeacherClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  async function fetchClasses() {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser()
      if (authErr) throw authErr
      if (!user) throw new Error('You must be signed in')

      // 1) classes assigned to this teacher
      const { data: assignments, error: assignErr } = await supabase
        .from('class_teachers')
        .select(`
          class_id,
          class:class_id (
            id,
            name,
            description,
            status,
            capacity,
            created_at
          )
        `)
        .eq('teacher_id', user.id)

      if (assignErr) throw assignErr

      const classRows = (assignments || [])
        .map((row) => row.class)
        .filter(Boolean)

      if (classRows.length === 0) {
        setClasses([])
        return
      }

      // 2) student counts per class in a single query
      const classIds = classRows.map((c) => c.id)
      const { data: studentRows, error: studentErr } = await supabase
        .from('class_students')
        .select('class_id')
        .in('class_id', classIds)

      if (studentErr) throw studentErr

      const counts = {}
      for (const row of studentRows || []) {
        counts[row.class_id] = (counts[row.class_id] || 0) + 1
      }

      setClasses(
        classRows.map((c) => ({
          ...c,
          studentCount: counts[c.id] || 0,
        })),
      )
    } catch (e) {
      console.error('Failed to load classes:', e)
      setError(e.message || 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  if (selectedClass) {
    return (
      <TeacherClassDetail
        classInfo={selectedClass}
        onBack={() => setSelectedClass(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm flex items-start gap-2">
        <FaExclamationTriangle className="mt-0.5" />
        <div>
          <p className="font-medium">Couldn't load your classes</p>
          <p className="text-xs mt-1">{error}</p>
          <button
            onClick={fetchClasses}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2d3f5d]">
            My Classes{' '}
            {!loading && (
              <span className="text-gray-400 font-normal">
                ({classes.length})
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500">
            Tap a class to view students and assignments
          </p>
        </div>
        <button
          onClick={fetchClasses}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
        >
          Refresh
        </button>
      </div>

      {classes.length === 0 ? (
        <EmptyClasses />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setSelectedClass(c)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-[#faa853] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
                    <FaBook className="text-[#faa853]" />
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      c.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : c.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {c.status || 'unknown'}
                  </span>
                </div>
                <p className="font-semibold text-[#2d3f5d] group-hover:text-[#faa853] transition-colors">
                  {displayName(c)}
                </p>
                {c.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {c.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-[#faa853] text-xs" />
                    {c.studentCount} student{c.studentCount === 1 ? '' : 's'}
                  </span>
                  <span className="flex items-center gap-1 text-[#faa853] font-medium group-hover:gap-2 transition-all">
                    Open <FaChevronRight className="text-xs" />
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyClasses() {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
      <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
      <p>No classes assigned yet.</p>
      <p className="text-sm mt-2">
        Ask an administrator to add you to a class.
      </p>
    </div>
  )
}

function displayName(c) {
  return c?.name?.trim() || 'Untitled class'
}