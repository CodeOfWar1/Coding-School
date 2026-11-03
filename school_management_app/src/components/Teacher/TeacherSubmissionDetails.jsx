import { useEffect, useState } from 'react'
import {
  FaArrowLeft,
  FaSpinner,
  FaClock,
  FaFile,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaPaperPlane,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import CodeEditor from '../Students/CodeEditor'
import FilePreview from '../Students/FilePreview'

export default function TeacherSubmissionDetail({
  task,
  student,
  submission,
  onBack,
}) {
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [score, setScore] = useState(
    submission?.score !== null && submission?.score !== undefined
      ? String(submission.score)
      : '',
  )
  const [passFail, setPassFail] = useState(submission?.pass_fail || '')
  const [feedback, setFeedback] = useState(submission?.feedback || '')

  useEffect(() => {
    // Auto-derive pass/fail when score changes
    if (!score) return
    const n = Number(score)
    if (Number.isNaN(n)) return
    setPassFail(n >= task.pass_threshold ? 'pass' : 'fail')
  }, [score, task.pass_threshold])

  const name =
    student?.profile?.full_name ||
    `${student?.profile?.first_name ?? ''} ${student?.profile?.last_name ?? ''}`.trim() ||
    student?.profile?.email ||
    'Student'

  const isCode = task.assignment_type !== 'reading'

  async function handleSave() {
    if (!submission) {
      setError('Student has not submitted this assignment yet.')
      return
    }
    if (!score) {
      setError('Enter a score first.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { error: upErr } = await supabase
        .from('coding_submissions')
        .update({
          score: Number(score),
          pass_fail: passFail || null,
          feedback: feedback.trim() || null,
          status: 'graded',
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq('id', submission.id)
      if (upErr) throw upErr

      await onBack()
    } catch (e) {
      console.error('Failed to save grade:', e)
      setError(e.message || 'Failed to save grade')
    } finally {
      setSaving(false)
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
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{task.title}</p>
          <h1 className="text-xl font-semibold text-[#2d3f5d] truncate">
            {name}
          </h1>
        </div>
      </div>

      {!submission ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
          <p>This student has not submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: student's work */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2">
                <p className="text-sm font-semibold text-[#2d3f5d]">
                  Student submission
                </p>
                {submission.submitted_at && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FaClock />
                    {new Date(submission.submitted_at).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-4">
                {submission.code_body?.trim() ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      Code
                    </p>
                    <CodeEditor
                      value={submission.code_body}
                      readOnly
                      languageHint={task.starter_code || task.title || ''}
                      height="360px"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No code text submitted.
                  </p>
                )}

                {submission.submission_files?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      Files
                    </p>
                    <ul className="space-y-2">
                      {submission.submission_files.map((f) => (
                        <li key={f.id}>
                          <button
                            onClick={() =>
                              setPreview({ url: f.file_url, name: f.file_name })
                            }
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:border-[#faa853]"
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
                )}
              </div>
            </div>
          </div>

          {/* Right: grading */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 sticky top-4">
              <div className="flex items-center gap-2">
                <FaPaperPlane className="text-[#faa853]" />
                <p className="text-sm font-semibold text-[#2d3f5d]">Grading</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Score (out of {task.points_max})
                </label>
                <input
                  type="number"
                  min={0}
                  max={task.points_max}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pass threshold: {task.pass_threshold}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Result
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPassFail('pass')}
                    className={`flex-1 py-1.5 rounded-lg text-sm flex items-center justify-center gap-1 border ${
                      passFail === 'pass'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaCheckCircle /> Pass
                  </button>
                                   <button
                    type="button"
                    onClick={() => setPassFail('fail')}
                    className={`flex-1 py-1.5 rounded-lg text-sm flex items-center justify-center gap-1 border ${
                      passFail === 'fail'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaTimesCircle /> Fail
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Feedback (optional)
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Comments for the student…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#faa853] outline-none"
                />
              </div>

              {submission.status === 'graded' && submission.graded_at && (
                <p className="text-xs text-gray-500">
                  Last graded{' '}
                  {new Date(submission.graded_at).toLocaleString()}
                </p>
              )}

              {error && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !score}
                className="w-full py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235] disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                {saving ? 'Saving…' : submission.status === 'graded' ? 'Update grade' : 'Save grade'}
              </button>
            </div>
          </div>
        </div>
      )}

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