import { useState, useMemo } from 'react'
import {
  FaClipboardList,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane,
  FaBook,
} from 'react-icons/fa'
import { passFailLabel } from '../../utils/teacherGrading'

function deadlineStatus(deadline) {
  if (!deadline) return null
  const due = new Date(deadline)
  const now = new Date()
  if (due < now) return { label: 'Past due', className: 'text-red-600 bg-red-50' }
  const days = (due - now) / (1000 * 60 * 60 * 24)
  if (days <= 3) return { label: 'Due soon', className: 'text-amber-700 bg-amber-50' }
  return { label: 'Open', className: 'text-green-700 bg-green-50' }
}

export default function StudentAssignments({
  classes,
  tasks,
  isLoading,
  error,
  getSubmissionForTask,
  submitAssignment,
  onRefresh,
  classDisplayName,
}) {
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [codeDraft, setCodeDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const tasksByClass = useMemo(() => {
    const map = new Map()
    for (const cls of classes) {
      map.set(cls.id, { cls, tasks: [] })
    }
    for (const task of tasks) {
      const classId = task.class_id
      const bucket = map.get(classId)
      if (bucket) bucket.tasks.push(task)
      else if (classId) {
        map.set(classId, {
          cls: { id: classId, name: 'Class' },
          tasks: [task],
        })
      }
    }
    return [...map.values()]
  }, [classes, tasks])

  const labelClass = classDisplayName || ((c) => c?.name || 'Class')

  const openTask = (task) => {
    const sub = getSubmissionForTask(task.id)
    setActiveTaskId(task.id)
    setCodeDraft(sub?.code_body ?? task.starter_code ?? '')
  }

  const closeTask = () => {
    setActiveTaskId(null)
    setCodeDraft('')
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId)
  const activeSub = activeTask ? getSubmissionForTask(activeTask.id) : null
  const canEdit = !activeSub || activeSub.status === 'submitted' || activeSub.status === 'returned'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!activeTask) return
    setSubmitting(true)
    try {
      await submitAssignment(activeTask.id, codeDraft)
      closeTask()
    } catch (err) {
      alert(err.message || 'Could not submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
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
          onClick={onRefresh}
          className="mt-3 text-sm text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!classes.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-[#2d3f5d] font-medium">No classes yet</p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          An administrator must assign you to a class. Published assignments for your classes will
          appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {tasks.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          You are in {classes.length} class(es). No published assignments yet — check back soon.
        </div>
      )}

      {tasksByClass.map(({ cls, tasks: classTasks }) => (
        <div key={cls.id} className="space-y-3">
          <h2 className="text-sm font-semibold text-[#2d3f5d] flex items-center gap-2">
            <FaClipboardList className="text-[#faa853]" />
            {labelClass(cls)}
          </h2>

          {classTasks.length === 0 ? (
            <p className="text-xs text-gray-500 pl-6">No assignments for this class.</p>
          ) : (
            <ul className="space-y-3">
              {classTasks.map((task) => {
                const sub = getSubmissionForTask(task.id)
                const due = deadlineStatus(task.deadline)
                return (
                  <li
                    key={task.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#faa853]/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => openTask(task)}
                          className="text-left font-semibold text-[#2d3f5d] hover:text-[#faa853]"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {task.points_max} pts · pass at {task.pass_threshold} pts
                          {task.deadline && (
                            <>
                              {' '}
                              · due {new Date(task.deadline).toLocaleString()}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {due && (
                          <span className={`text-xs px-2 py-0.5 rounded ${due.className}`}>
                            {due.label}
                          </span>
                        )}
                        <SubmissionBadge submission={sub} task={task} />
                        <button
                          type="button"
                          onClick={() => openTask(task)}
                          className="text-sm text-[#faa853] font-medium hover:underline"
                        >
                          {sub ? (sub.status === 'graded' ? 'View' : 'Continue') : 'Start'}
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

      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeTask}
            aria-hidden
          />
          <div className="relative bg-white w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#2d3f5d]">{activeTask.title}</h3>
                {activeTask.deadline && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <FaClock /> Due {new Date(activeTask.deadline).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeTask}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              {activeTask.instructions && (
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {activeTask.instructions}
                </div>
              )}

              {activeSub?.status === 'graded' && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-900 flex items-center gap-2">
                    <FaCheckCircle />
                    Graded: {activeSub.score} / {activeTask.points_max} pts ·{' '}
                    <span
                      className={
                        activeSub.pass_fail === 'pass' ? 'text-green-700' : 'text-red-700'
                      }
                    >
                      {passFailLabel(activeSub.pass_fail)}
                    </span>
                  </p>
                  {activeSub.feedback && (
                    <p className="text-sm text-green-800 mt-2">{activeSub.feedback}</p>
                  )}
                </div>
              )}

              {activeSub?.status === 'submitted' && !activeSub.score && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Submitted — waiting for teacher to grade.
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-sm font-medium text-[#2d3f5d]">Your code</label>
                <textarea
                  value={codeDraft}
                  onChange={(e) => setCodeDraft(e.target.value)}
                  readOnly={!canEdit}
                  rows={14}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono disabled:bg-gray-50"
                  placeholder="// Write your solution here"
                  spellCheck={false}
                />
                {canEdit && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#faa853] text-white rounded-lg font-medium text-sm hover:bg-[#e89235] disabled:opacity-50"
                  >
                    {submitting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                    {activeSub ? 'Resubmit' : 'Submit assignment'}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SubmissionBadge({ submission, task }) {
  if (!submission) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">Not started</span>
    )
  }
  if (submission.status === 'graded') {
    const passed = submission.pass_fail === 'pass'
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded inline-flex items-center gap-1 ${
          passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {passed ? <FaCheckCircle /> : <FaTimesCircle />}
        {submission.score}/{task.points_max} · {passFailLabel(submission.pass_fail)}
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
      Submitted
    </span>
  )
}
