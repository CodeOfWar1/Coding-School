import { useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import TeacherClassPicker from './TeacherClassPicker'
import { passFailLabel, computePassFail } from '../../utils/teacherGrading'

export default function TeacherGrading({
  classes,
  selectedClassId,
  setSelectedClassId,
  submissions,
  gradeSubmission,
}) {
  const [gradingId, setGradingId] = useState(null)
  const [forms, setForms] = useState({})

  const getForm = (sub) => {
    const task = sub.task || {}
    const base = {
      score: sub.score ?? '',
      feedback: sub.feedback ?? '',
    }
    return { ...base, ...(forms[sub.id] || {}) }
  }

  const setFormField = (sub, field, value) => {
    setForms((prev) => ({
      ...prev,
      [sub.id]: { ...getForm(sub), [field]: value },
    }))
  }

  const handleGrade = async (sub) => {
    const task = sub.task || {}
    const f = forms[sub.id] ?? {
      score: sub.score ?? '',
      feedback: sub.feedback ?? '',
    }
    setGradingId(sub.id)
    try {
      await gradeSubmission(sub.id, {
        score: f.score,
        feedback: f.feedback,
        pointsMax: task.points_max ?? 100,
        passThreshold: task.pass_threshold ?? 60,
      })
    } catch (err) {
      alert(err.message || 'Could not save grade')
    } finally {
      setGradingId(null)
    }
  }

  const pending = submissions.filter((s) => s.status === 'submitted')
  const graded = submissions.filter((s) => s.status === 'graded')

  if (!classes.length) {
    return <p className="text-gray-500 text-sm">No assigned classes. Assignments and grading appear once admin adds you to a class.</p>
  }

  return (
    <div className="space-y-6">
      <TeacherClassPicker
        classes={classes}
        selectedClassId={selectedClassId}
        onSelect={setSelectedClassId}
      />

      {selectedClassId && (
        <>
          <SubmissionList
            title={`Needs grading (${pending.length})`}
            items={pending}
            gradingId={gradingId}
            getForm={getForm}
            setFormField={setFormField}
            onGrade={handleGrade}
            emptyText="No submissions waiting for grades."
          />
          <SubmissionList
            title={`Graded (${graded.length})`}
            items={graded}
            gradingId={gradingId}
            getForm={getForm}
            setFormField={setFormField}
            onGrade={handleGrade}
            emptyText="No graded submissions yet."
            showResult
          />
        </>
      )}
    </div>
  )
}

function SubmissionList({
  title,
  items,
  gradingId,
  getForm,
  setFormField,
  onGrade,
  emptyText,
  showResult,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-[#2d3f5d]">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="p-6 text-sm text-gray-500 text-center">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((sub) => {
            const task = sub.task || {}
            const f = getForm(sub)
            const previewPass = computePassFail(
              f.score === '' ? null : Number(f.score),
              task.points_max ?? 100,
              task.pass_threshold ?? 60,
            )
            return (
              <li key={sub.id} className="p-4 space-y-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#2d3f5d]">{task.title || 'Assignment'}</p>
                    <p className="text-xs text-gray-500">
                      {sub.student?.full_name ||
                        [sub.student?.first_name, sub.student?.last_name].filter(Boolean).join(' ') ||
                        sub.student?.email ||
                        'Student'}{' '}
                      · submitted {new Date(sub.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {showResult && (
                    <div className="text-right text-sm">
                      <p className="font-semibold text-[#2d3f5d]">
                        {sub.score != null ? `${sub.score} / ${task.points_max}` : '—'}
                      </p>
                      <span
                        className={`text-xs font-medium ${
                          sub.pass_fail === 'pass' ? 'text-green-700' : 'text-red-600'
                        }`}
                      >
                        {passFailLabel(sub.pass_fail)}
                      </span>
                    </div>
                  )}
                </div>
                {sub.code_body && (
                  <pre className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto max-h-40 font-mono">
                    {sub.code_body}
                  </pre>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Score (max {task.points_max})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={task.points_max ?? 100}
                      value={f.score}
                      onChange={(e) => setFormField(sub, 'score', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-end gap-2">
                    <p className="text-sm text-gray-600 pb-2">
                      Preview:{' '}
                      <span
                        className={
                          previewPass === 'pass'
                            ? 'text-green-700 font-medium'
                            : previewPass === 'fail'
                              ? 'text-red-600 font-medium'
                              : ''
                        }
                      >
                        {passFailLabel(previewPass)}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">
                        (≥ {task.pass_threshold} pts)
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Feedback</label>
                  <textarea
                    rows={2}
                    value={f.feedback}
                    onChange={(e) => setFormField(sub, 'feedback', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={gradingId === sub.id}
                  onClick={() => onGrade(sub)}
                  className="px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235] disabled:opacity-50 transition-colors"
                >
                  {gradingId === sub.id ? (
                    <FaSpinner className="animate-spin inline" />
                  ) : showResult ? (
                    'Update grade'
                  ) : (
                    'Save grade'
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
