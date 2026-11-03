import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FaClipboardList,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaPaperPlane,
  FaBook,
  FaArrowLeft,
  FaFile,
  FaUpload,
  FaTrash,
  FaCode,
  FaAlignLeft,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import FilePreview from './FilePreview'
import CodeEditor from './CodeEditor'

function deadlineStatus(deadline) {
  if (!deadline) return null
  const due = new Date(deadline)
  const now = new Date()
  if (due < now) return { label: 'Past due', className: 'text-red-600 bg-red-50' }
  const days = (due - now) / (1000 * 60 * 60 * 24)
  if (days <= 3) return { label: 'Due soon', className: 'text-amber-700 bg-amber-50' }
  return { label: 'Open', className: 'text-green-700 bg-green-50' }
}

function submissionLabel(sub) {
  if (!sub) return { label: 'Not started', className: 'bg-gray-100 text-gray-600' }
  if (sub.status === 'graded') {
    return sub.pass_fail === 'pass'
      ? { label: 'Passed', className: 'bg-green-100 text-green-800' }
      : { label: 'Failed', className: 'bg-red-100 text-red-800' }
  }
  return { label: 'Submitted', className: 'bg-amber-100 text-amber-800' }
}

export default function StudentAssignments({ studentId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [classes, setClasses] = useState([])
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])

  const [view, setView] = useState('list') // 'list' | 'detail' | 'submit'
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [preview, setPreview] = useState(null)

  // ---------- loaders ----------
  const loadAll = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      // 1) classes the student belongs to
      const { data: classStudents, error: csErr } = await supabase
        .from('class_students')
        .select('class_id, class:class_id (id, name, description, status)')
        .eq('student_user_id', studentId)
      if (csErr) throw csErr

      const myClasses = (classStudents || []).map((r) => r.class).filter(Boolean)
      const classIds = myClasses.map((c) => c.id)

      if (classIds.length === 0) {
        setClasses([])
        setTasks([])
        setSubmissions([])
        return
      }

      // 2) published tasks + this student's submissions (with files)
      const [tasksRes, subsRes] = await Promise.all([
        supabase
          .from('coding_tasks')
          .select('*')
          .in('class_id', classIds)
          .eq('published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('coding_submissions')
          .select(`
            *,
            submission_files (id, file_url, file_name, mime_type, size_bytes)
          `)
          .eq('student_id', studentId),
      ])

      if (tasksRes.error) throw tasksRes.error
      if (subsRes.error) throw subsRes.error

      setClasses(myClasses)
      setTasks(tasksRes.data || [])
      setSubmissions(subsRes.data || [])
    } catch (e) {
      console.error('Failed to load assignments:', e)
      setError(e.message || 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const getSubmissionForTask = useCallback(
    (taskId) => submissions.find((s) => s.task_id === taskId) || null,
    [submissions],
  )

  const submitAssignment = useCallback(
    async (taskId, codeBody) => {
      const { data, error } = await supabase
        .from('coding_submissions')
        .upsert(
          {
            task_id: taskId,
            student_id: studentId,
            code_body: codeBody || null,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
          { onConflict: 'task_id,student_id' },
        )
        .select('id')
        .single()
      if (error) throw error
      return data.id
    },
    [studentId],
  )

  // ---------- derived ----------
  const tasksByClass = useMemo(() => {
    const map = new Map()
    for (const cls of classes) map.set(cls.id, { cls, tasks: [] })
    for (const task of tasks) {
      const bucket = map.get(task.class_id)
      if (bucket) bucket.tasks.push(task)
      else if (task.class_id) {
        map.set(task.class_id, {
          cls: { id: task.class_id, name: 'Class' },
          tasks: [task],
        })
      }
    }
    return [...map.values()]
  }, [classes, tasks])

  const activeTask = tasks.find((t) => t.id === activeTaskId) || null
  const activeSub = activeTask ? getSubmissionForTask(activeTask.id) : null

  const labelClass = (c) => c?.name || 'Class'

  // ---------- render states ----------
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
          onClick={loadAll}
          className="mt-3 text-sm text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-[#2d3f5d] font-medium">No classes yet</p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          An administrator must assign you to a class. Published assignments for
          your classes will appear here.
        </p>
      </div>
    )
  }

  // ---------- detail ----------
  if (view === 'detail' && activeTask) {
    return (
      <AssignmentDetail
        task={activeTask}
        submission={activeSub}
        classLabel={labelClass(classes.find((c) => c.id === activeTask.class_id))}
        onBack={() => {
          setView('list')
          setActiveTaskId(null)
        }}
        onStartSubmit={() => setView('submit')}
        onPreview={(url, name) => setPreview({ url, name })}
        preview={preview}
        onClosePreview={() => setPreview(null)}
      />
    )
  }

  // ---------- submit ----------
  if (view === 'submit' && activeTask) {
    return (
      <SubmitAssignment
        task={activeTask}
        existing={activeSub}
        onBack={() => setView('detail')}
        onDone={async () => {
          await loadAll()
          setView('detail')
        }}
        submitAssignment={submitAssignment}
      />
    )
  }

  // ---------- list ----------
  return (
    <div className="space-y-6">
      {tasks.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          You are in {classes.length} class(es). No published assignments yet —
          check back soon.
        </div>
      )}

      {tasksByClass.map(({ cls, tasks: classTasks }) => (
        <div key={cls.id} className="space-y-3">
          <h2 className="text-sm font-semibold text-[#2d3f5d] flex items-center gap-2">
            <FaClipboardList className="text-[#faa853]" />
            {labelClass(cls)}
          </h2>

          {classTasks.length === 0 ? (
            <p className="text-xs text-gray-500 pl-6">
              No assignments for this class.
            </p>
          ) : (
            <ul className="space-y-3">
              {classTasks.map((task) => {
                const sub = getSubmissionForTask(task.id)
                const due = deadlineStatus(task.deadline)
                const badge = submissionLabel(sub)
                return (
                  <li
                    key={task.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#faa853]/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTaskId(task.id)
                            setView('detail')
                          }}
                          className="text-left font-semibold text-[#2d3f5d] hover:text-[#faa853]"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {task.assignment_type === 'reading' ? 'Reading' : 'Coding'} ·{' '}
                          {task.points_max} pts · pass at {task.pass_threshold} pts
                          {task.deadline && (
                            <> · due {new Date(task.deadline).toLocaleString()}</>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {due && (
                          <span className={`text-xs px-2 py-0.5 rounded ${due.className}`}>
                            {due.label}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${badge.className}`}>
                          {badge.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTaskId(task.id)
                            setView('detail')
                          }}
                          className="text-sm text-[#faa853] font-medium hover:underline"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---------------- Detail ---------------- */

function AssignmentDetail({
  task,
  submission,
  classLabel,
  onBack,
  onStartSubmit,
  onPreview,
  preview,
  onClosePreview,
}) {
  const isCode = task.assignment_type !== 'reading'
  const due = deadlineStatus(task.deadline)

  const hasCodeBody = Boolean(submission?.code_body?.trim())
  const hasFiles = (submission?.submission_files?.length ?? 0) > 0
  const hasSubmission = Boolean(submission)
  const isGraded = submission?.status === 'graded'

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
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{classLabel}</p>
          <h1 className="text-xl font-semibold text-[#2d3f5d] truncate">
            {task.title}
          </h1>
        </div>
      </div>

      {/* Task details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isCode ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {isCode ? <FaCode /> : <FaAlignLeft />}
            {isCode ? 'Coding' : 'Reading'}
          </span>
          {due && (
            <span className={`text-xs px-2 py-0.5 rounded ${due.className}`}>
              {due.label}
            </span>
          )}
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

        {/* ---- Teacher's starter code (read-only, clearly labeled) ---- */}
        {isCode && task.starter_code && (
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-blue-50 px-3 py-2 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <FaCode className="text-blue-600" />
                <p className="text-sm font-medium text-blue-900">
                  Teacher's starter code
                </p>
              </div>
              <span className="text-xs text-blue-700 bg-white border border-blue-200 rounded px-2 py-0.5">
                Read-only
              </span>
            </div>
            <div className="p-0">
              <CodeEditor
                value={task.starter_code}
                readOnly
                languageHint={task.starter_code}
                height="500px"
              />
            </div>
            <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 border-t border-blue-100">
              This is the starting point your teacher provided. Your own code is
              below.
            </p>
          </div>
        )}

        {/* ---- Task attachment (teacher-supplied file) ---- */}
        {task.attachment_url && (
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
              Teacher's attachment
            </p>
            <button
              onClick={() =>
                onPreview(
                  task.attachment_url,
                  task.attachment_name || 'Attachment',
                )
              }
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#2d3f5d] hover:border-[#faa853]"
            >
              <FaFile className="text-[#faa853]" />
              {task.attachment_name || 'Open attachment'}
            </button>
          </div>
        )}
      </div>

      {/* ---- Your submission ---- */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <FaPaperPlane className="text-[#faa853]" />
            <p className="text-sm font-semibold text-[#2d3f5d]">
              Your submission
            </p>
          </div>
          {hasSubmission ? (
            isGraded ? (
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 flex items-center gap-1">
                <FaCheckCircle className="text-xs" /> Graded
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Submitted · awaiting grade
              </span>
            )
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              Not submitted
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {!hasSubmission && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                You haven't submitted this assignment yet.
              </p>
              <button
                onClick={onStartSubmit}
                className="mt-3 px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235] inline-flex items-center gap-2"
              >
                <FaPaperPlane /> Start submission
              </button>
            </div>
          )}

          {hasSubmission && (
            <>
              {/* Submitted timestamp */}
              {submission.submitted_at && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaClock />
                  Submitted{' '}
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>
              )}

              {/* Your code */}
              {hasCodeBody && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                    Your code
                  </p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <CodeEditor
                      value={submission.code_body}
                      readOnly
                      languageHint={task.starter_code || task.title || ''}
                      height="500px"
                    />
                  </div>
                </div>
              )}

              {/* Your files */}
              {hasFiles ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                    Your files
                  </p>
                  <ul className="space-y-2">
                    {submission.submission_files.map((f) => (
                      <li key={f.id}>
                        <button
                          onClick={() => onPreview(f.file_url, f.file_name)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#2d3f5d] hover:border-[#faa853] hover:bg-[#faa853]/5"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FaFile className="text-[#faa853]" />
                            <span className="truncate">{f.file_name}</span>
                          </span>
                          {f.size_bytes ? (
                            <span className="text-xs text-gray-400 shrink-0">
                              {Math.round(f.size_bytes / 1024)} KB
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : !hasCodeBody ? (
                <p className="text-sm text-gray-500">
                  No files or text were submitted.
                </p>
              ) : null}

              {/* Edit button when not graded */}
              {!isGraded && (
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={onStartSubmit}
                    className="px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235] inline-flex items-center gap-2"
                  >
                    <FaPaperPlane /> Edit submission
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---- Grade feedback ---- */}
      {isGraded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-900 flex items-center gap-2">
            <FaCheckCircle />
            Graded: {submission.score} / {task.points_max} ·{' '}
            <span
              className={
                submission.pass_fail === 'pass' ? 'text-green-700' : 'text-red-700'
              }
            >
              {submission.pass_fail === 'pass' ? 'Pass' : 'Fail'}
            </span>
          </p>
          {submission.feedback && (
            <p className="text-sm text-green-800 mt-2">{submission.feedback}</p>
          )}
        </div>
      )}

      {preview && (
        <FilePreview
          url={preview.url}
          name={preview.name}
          onClose={onClosePreview}
        />
      )}
    </div>
  )
}

/* ---------------- Submit ---------------- */

function SubmitAssignment({ task, existing, onBack, onDone, submitAssignment }) {
  const isCode = task.assignment_type !== 'reading'
  const [mode, setMode] = useState(isCode ? 'code' : 'text')
  const [textValue, setTextValue] = useState(
    existing?.code_body ?? (isCode ? task.starter_code ?? '' : ''),
  )
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function addFiles(picked) {
    const list = Array.from(picked || [])
    if (!list.length) return
    const mapped = list.map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
    }))
    setFiles((prev) => [...prev, ...mapped])
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!textValue.trim() && files.length === 0) {
      setError('Add some text or at least one file')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const submissionId = await submitAssignment(task.id, textValue)

      if (files.length) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Not signed in')

        if (existing?.submission_files?.length) {
          await supabase
            .from('submission_files')
            .delete()
            .eq('submission_id', submissionId)

          for (const f of existing.submission_files) {
            const path = f.file_url?.split('/submissions/')[1]?.split('?')[0]
            if (path) await supabase.storage.from('submissions').remove([path])
          }
        }

        const uploaded = []
        for (const f of files) {
          const ext = f.file.name.split('.').pop() || 'bin'
          const path = `${user.id}/${task.id}/${crypto.randomUUID()}.${ext}`
          const { error: upErr } = await supabase.storage
            .from('submissions')
            .upload(path, f.file, { contentType: f.file.type || undefined })
          if (upErr) throw upErr

          const { data: signed } = await supabase.storage
            .from('submissions')
            .createSignedUrl(path, 60 * 60 * 24 * 365)

          uploaded.push({
            submission_id: submissionId,
            file_url: signed?.signedUrl || null,
            file_name: f.file.name,
            mime_type: f.file.type || null,
            size_bytes: f.file.size,
          })
        }

        const { error: insErr } = await supabase
          .from('submission_files')
          .insert(uploaded)
        if (insErr) throw insErr
      }

      await onDone()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <FaArrowLeft />
        </button>
        <div>
          <p className="text-xs text-gray-500">Submitting</p>
          <h1 className="text-xl font-semibold text-[#2d3f5d]">{task.title}</h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-5 space-y-5"
      >
        {isCode && (
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setMode('code')}
              className={`px-3 py-1.5 flex items-center gap-1 ${
                mode === 'code' ? 'bg-[#faa853] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaCode /> Code
            </button>
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 flex items-center gap-1 border-l border-gray-300 ${
                mode === 'text' ? 'bg-[#faa853] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaAlignLeft /> Notes
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#2d3f5d] mb-2">
            {mode === 'code' ? 'Your code' : 'Your answer'}
          </label>
          {mode === 'code' ? (
            <CodeEditor
              value={textValue}
              onChange={setTextValue}
              languageHint={task.starter_code || task.title || ''}
              height="420px"
            />
          ) : (
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              rows={12}
              placeholder={
                isCode ? 'Optional notes / explanation' : 'Write your answer here…'
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2d3f5d] mb-2">
            Attachments
          </label>

          <label className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:border-[#faa853] text-sm text-gray-500">
            <FaUpload className="text-[#faa853]" />
            Add files (any type: .py, .java, .html, .pdf, images…)
            <input
              type="file"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-700 truncate">
                    <FaFile className="text-[#faa853]" />
                    {f.file.name}{' '}
                    <span className="text-xs text-gray-400">
                      ({Math.round(f.file.size / 1024)} KB)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
                  >
                    <FaTrash /> Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#faa853] text-white rounded-lg font-medium text-sm hover:bg-[#e89235] disabled:opacity-50 inline-flex items-center gap-2"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            {existing ? 'Resubmit' : 'Submit assignment'}
          </button>
        </div>
      </form>
    </div>
  )
}