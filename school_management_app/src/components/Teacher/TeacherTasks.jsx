import { useCallback, useEffect, useState } from 'react'
import {
  FaPlus,
  FaSpinner,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaClipboardList,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import TeacherClassPicker from './TeacherClassPicker'
import TeacherAssignmentDetail from './TeacherAssingmentDetails'
import CodeEditor from '../Students/CodeEditor'

const EMPTY_TASK = {
  title: '',
  description: '',
  instructions: '',
  deadline: '',
  points_max: 100,
  pass_threshold: 60,
  published: false,
  starter_code: '',
  content: '',
  assignment_type: 'coding',
}

export default function TeacherTasks({
  classes = [],
  selectedClassId,
  setSelectedClassId,
}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_TASK)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const [openTaskId, setOpenTaskId] = useState(null)

  const loadTasks = useCallback(async () => {
    if (!selectedClassId) {
      setTasks([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('coding_tasks')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setTasks(data || [])
    } catch (e) {
      console.error('Failed to load tasks:', e)
      setError(e.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [selectedClassId])

  useEffect(() => {
    loadTasks()
    setOpenTaskId(null)
  }, [loadTasks])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !selectedClassId) return
    setSaving(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const payload = {
        class_id: selectedClassId,
        teacher_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        instructions: form.instructions.trim() || null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        points_max: Number(form.points_max) || 100,
        pass_threshold: Number(form.pass_threshold) || 60,
        published: Boolean(form.published),
        assignment_type: form.assignment_type,
        starter_code:
          form.assignment_type === 'coding' ? form.starter_code || null : null,
        content:
          form.assignment_type === 'reading' ? form.content || null : null,
      }

      const { error: insErr } = await supabase
        .from('coding_tasks')
        .insert(payload)
      if (insErr) throw insErr

      setForm(EMPTY_TASK)
      setShowForm(false)
      await loadTasks()
    } catch (e) {
      console.error('Failed to create task:', e)
      setError(e.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (task) => {
    setBusyId(task.id)
    try {
      const { error: err } = await supabase
        .from('coding_tasks')
        .update({ published: !task.published })
        .eq('id', task.id)
      if (err) throw err
      await loadTasks()
    } catch (e) {
      console.error(e)
      alert('Could not update assignment')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    setBusyId(task.id)
    try {
      const { error: err } = await supabase
        .from('coding_tasks')
        .delete()
        .eq('id', task.id)
      if (err) throw err
      await loadTasks()
    } catch (e) {
      console.error(e)
      alert('Could not delete assignment')
    } finally {
      setBusyId(null)
    }
  }

  // ---------- drill into a single assignment ----------
  if (openTaskId) {
    return (
      <TeacherAssignmentDetail
        taskId={openTaskId}
        onBack={() => {
          setOpenTaskId(null)
          loadTasks()
        }}
      />
    )
  }

  if (!classes.length) {
    return (
      <p className="text-gray-500 text-sm">
        You need an admin-assigned class before adding assignments.
      </p>
    )
  }

  const activeTask = tasks.find((t) => t.id === openTaskId)

  return (
    <div className="space-y-6">
      <TeacherClassPicker
        classes={classes}
        selectedClassId={selectedClassId}
        onSelect={setSelectedClassId}
      />

      {selectedClassId && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235] transition-colors"
            >
              <FaPlus /> New assignment
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreate}
              className="bg-white border border-gray-200 rounded-xl p-5 space-y-4"
            >
              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, assignment_type: 'coding' }))
                  }
                  className={`px-3 py-1.5 ${
                    form.assignment_type === 'coding'
                      ? 'bg-[#faa853] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Coding
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, assignment_type: 'reading' }))
                  }
                  className={`px-3 py-1.5 border-l border-gray-300 ${
                    form.assignment_type === 'reading'
                      ? 'bg-[#faa853] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Reading
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                    Title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                    Due date
                  </label>
                  <input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deadline: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                      Max points
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.points_max}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, points_max: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                      Pass threshold
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.pass_threshold}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          pass_threshold: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                    Short description
                  </label>
                  <input
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                    Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={form.instructions}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, instructions: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                {form.assignment_type === 'coding' ? (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                      Starter code
                    </label>
                    <CodeEditor
                      value={form.starter_code}
                      onChange={(v) =>
                        setForm((f) => ({ ...f, starter_code: v }))
                      }
                      height="220px"
                      languageHint={form.title}
                    />
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                      Reading content
                    </label>
                    <textarea
                      rows={6}
                      value={form.content}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, content: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, published: e.target.checked }))
                    }
                  />
                  Publish immediately
                </label>
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm hover:bg-[#e89235] disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                  {saving ? 'Saving…' : 'Create assignment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setForm(EMPTY_TASK)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <FaSpinner className="animate-spin text-[#faa853] text-2xl" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
              <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
              <p>No assignments yet for this class.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#faa853]/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setOpenTaskId(task.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#2d3f5d]">
                          {task.title}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                          {task.assignment_type === 'reading'
                            ? 'Reading'
                            : 'Coding'}
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
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.points_max} pts · pass at {task.pass_threshold} pts
                        {task.deadline
                          ? ` · due ${new Date(task.deadline).toLocaleString()}`
                          : ''}
                      </p>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOpenTaskId(task.id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
                      >
                        View <FaArrowRight className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(task)}
                        disabled={busyId === task.id}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        title={task.published ? 'Unpublish' : 'Publish'}
                      >
                        {task.published ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task)}
                        disabled={busyId === task.id}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}