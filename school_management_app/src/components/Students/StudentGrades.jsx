import { useCallback, useEffect, useState } from 'react'
import {
  FaSpinner,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBook,
  FaCode,
  FaAlignLeft,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

export default function StudentGrades({ studentId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([])
  const [hasClasses, setHasClasses] = useState(true)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      // 1) classes the student belongs to
      const { data: classStudents, error: csErr } = await supabase
        .from('class_students')
        .select('class_id, class:class_id (id, name)')
        .eq('student_user_id', studentId)
      if (csErr) throw csErr

      const myClasses = (classStudents || []).map((r) => r.class).filter(Boolean)
      const classIds = myClasses.map((c) => c.id)

      if (classIds.length === 0) {
        setHasClasses(false)
        setRows([])
        return
      }
      setHasClasses(true)

      const classById = Object.fromEntries(myClasses.map((c) => [c.id, c]))

      // 2) published tasks for those classes
      const { data: tasks, error: tErr } = await supabase
        .from('coding_tasks')
        .select('id, title, class_id, assignment_type, points_max, pass_threshold, deadline')
        .in('class_id', classIds)
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (tErr) throw tErr

      if (!tasks || tasks.length === 0) {
        setRows([])
        return
      }

      // 3) this student's submissions for those tasks
      const taskIds = tasks.map((t) => t.id)
      const { data: subs, error: sErr } = await supabase
        .from('coding_submissions')
        .select('id, task_id, status, score, pass_fail, feedback, graded_at')
        .eq('student_id', studentId)
        .in('task_id', taskIds)
      if (sErr) throw sErr

      const subByTask = Object.fromEntries((subs || []).map((s) => [s.task_id, s]))

      // 4) merge
      const merged = tasks.map((t) => ({
        task: t,
        klass: classById[t.class_id] || { id: t.class_id, name: 'Class' },
        submission: subByTask[t.id] || null,
      }))

      setRows(merged)
    } catch (e) {
      console.error('Failed to load grades:', e)
      setError(e.message || 'Failed to load grades')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 text-sm text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!hasClasses) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-[#2d3f5d] font-medium">No classes yet</p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Once you're enrolled in a class, your grades will appear here.
        </p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-[#2d3f5d] font-medium">No assignments yet</p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Grades will appear here as soon as your teacher posts assignments.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
          <FaClipboardList className="text-[#faa853]" />
          Grades ({rows.length})
        </h3>
        <span className="text-xs text-gray-500">
          {rows.filter((r) => r.submission?.status === 'graded').length} graded
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Assignment
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Class
              </th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium">
                Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ task, klass, submission }) => (
              <tr key={task.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        task.assignment_type === 'reading'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {task.assignment_type === 'reading' ? (
                        <FaAlignLeft />
                      ) : (
                        <FaCode />
                      )}
                    </span>
                    <span className="font-medium text-[#2d3f5d] truncate">
                      {task.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{klass.name}</td>
                <td className="px-4 py-3 text-right">
                  <GradeCell task={task} submission={submission} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GradeCell({ task, submission }) {
  if (!submission || submission.status !== 'graded') {
    if (submission && submission.status === 'submitted') {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
          <FaHourglassHalf className="text-xs" />
          Pending
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
        Not submitted
      </span>
    )
  }

  const passed = submission.pass_fail === 'pass'
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium ${
        passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {passed ? <FaCheckCircle className="text-xs" /> : <FaTimesCircle className="text-xs" />}
      {submission.score} / {task.points_max} · {passed ? 'Pass' : 'Fail'}
    </span>
  )
}