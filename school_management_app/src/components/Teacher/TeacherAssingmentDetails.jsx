import { useCallback, useEffect, useState } from 'react'
import {
  FaArrowLeft,
  FaSpinner,
  FaClock,
  FaFile,
  FaCode,
  FaAlignLeft,
  FaUsers,
  FaCheckCircle,
  FaHourglassHalf,
  FaArrowRight,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import CodeEditor from '../Students/CodeEditor'
import FilePreview from '../Students/FilePreview'
import TeacherSubmissionDetail from './TeacherSubmissionDetails'

export default function TeacherAssignmentDetail({ taskId, onBack }) {
  const [task, setTask] = useState(null)
  const [students, setStudents] = useState([])   // class_students + profile
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [openStudentId, setOpenStudentId] = useState(null)
  const [preview, setPreview] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1) task
      const { data: t, error: tErr } = await supabase
        .from('coding_tasks')
        .select('*')
        .eq('id', taskId)
        .single()
      if (tErr) throw tErr
      setTask(t)

      // 2) class roster
      const { data: roster, error: rErr } = await supabase
        .from('class_students')
        .select(`
          id,
          student_user_id,
          profile:student_user_id (id, first_name, last_name, full_name, email)
        `)
        .eq('class_id', t.class_id)
      if (rErr) throw rErr
      setStudents(roster || [])

      // 3) submissions for this task
      const { data: subs, error: sErr } = await supabase
        .from('coding_submissions')
        .select(`
          *,
          submission_files (id, file_url, file_name, mime_type, size_bytes)
        `)
        .eq('task_id', taskId)
      if (sErr) throw sErr
      setSubmissions(subs || [])
    } catch (e) {
      console.error('Failed to load assignment:', e)
      setError(e.message || 'Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }, [taskId])

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

  if (error || !task) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        {error || 'Assignment not found'}
        <button onClick={load} className="ml-2 underline">
          Retry
        </button>
      </div>
    )
  }

  // ----- submission detail view -----
  if (openStudentId) {
    const student = students.find((s) => s.student_user_id === openStudentId)
    const submission = submissions.find((s) => s.student_id === openStudentId)
    return (
      <TeacherSubmissionDetail
        task={task}
        student={student}
        submission={submission}
        onBack={() => {
          setOpenStudentId(null)
          load()
        }}
      />
    )
  }

  const isCode = task.assignment_type !== 'reading'
  const submissionByStudent = new Map(submissions.map((s) => [s.student_id, s]))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <FaArrowLeft />
        </button>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Assignment</p>
          <h1 className="text-xl font-semibold text-[#2d3f5d] truncate">
            {task.title}
          </h1>
        </div>
      </div>

      {/* Teacher's content */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isCode
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {isCode ? <FaCode /> : <FaAlignLeft />}
            {isCode ? 'Coding' : 'Reading'}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              task.published
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {task.published ? 'Published' : 'Draft'}
          </span>
          <span className="text-xs text-gray-500">
            {task.points_max} pts · pass at {task.pass_threshold}
          </span>
          {task.deadline && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <FaClock /> Due {new Date(task.deadline).toLocaleString()}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-700">{task.description}</p>
        )}

        {task.instructions && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
            {task.instructions}
          </div>
        )}

        {task.assignment_type === 'reading' && task.content && (
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Reading material
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {task.content}
            </p>
          </div>
        )}

        {isCode && task.starter_code && (
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-blue-50 px-3 py-2 border-b border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Your starter code
              </p>
              <span className="text-xs text-blue-700 bg-white border border-blue-200 rounded px-2 py-0.5">
                Read-only
              </span>
            </div>
            <CodeEditor
              value={task.starter_code}
              readOnly
              languageHint={task.starter_code}
              height="200px"
            />
          </div>
        )}

        {task.attachment_url && (
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Your attachment
            </p>
            <button
              onClick={() =>
                setPreview({
                  url: task.attachment_url,
                  name: task.attachment_name || 'Attachment',
                })
              }
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#2d3f5d] hover:border-[#faa853]"
            >
              <FaFile className="text-[#faa853]" />
              {task.attachment_name || 'Open attachment'}
            </button>
          </div>
        )}
      </div>

      {/* Submissions */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <FaUsers className="text-[#faa853]" />
            <p className="text-sm font-semibold text-[#2d3f5d]">
              Submissions ({students.length})
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {submissions.length} submitted ·{' '}
            {students.length - submissions.length} pending
          </span>
        </div>

        {students.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">
            No students in this class yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {students.map((s) => {
              const sub = submissionByStudent.get(s.student_user_id)
              const name =
                s.profile?.full_name ||
                `${s.profile?.first_name ?? ''} ${s.profile?.last_name ?? ''}`.trim() ||
                s.profile?.email ||
                'Student'
              return (
                <li
                  key={s.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#2d3f5d] truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {s.profile?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!sub && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        Not submitted
                      </span>
                    )}
                    {sub && sub.status !== 'graded' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <FaHourglassHalf className="text-xs" /> Awaiting grade
                      </span>
                    )}
                    {sub && sub.status === 'graded' && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                          sub.pass_fail === 'pass'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <FaCheckCircle className="text-xs" />
                        {sub.score} / {task.points_max} ·{' '}
                        {sub.pass_fail === 'pass' ? 'Pass' : 'Fail'}
                      </span>
                    )}
                    <button
                      onClick={() => setOpenStudentId(s.student_user_id)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
                    >
                      {sub ? 'View' : 'Open'}{' '}
                      <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {preview && (
        <FilePreview
          url={preview.url}
          name={preview.name}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}