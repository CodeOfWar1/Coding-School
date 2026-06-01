import { useState } from 'react'
import { FaPlus, FaSpinner, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa'
import TeacherClassPicker from './TeacherClassPicker'

const emptyTask = {
  title: '',
  description: '',
  instructions: '',
  deadline: '',
  points_max: 100,
  pass_threshold: 60,
  published: false,
  starter_code: '',
}

export default function TeacherTasks({
  classes,
  selectedClassId,
  setSelectedClassId,
  tasks,
  createTask,
  updateTask,
  deleteTask,
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyTask)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await createTask({
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      })
      setForm(emptyTask)
      setShowForm(false)
    } catch (err) {
      alert(err.message || 'Could not create task')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (task) => {
    try {
      await updateTask(task.id, { published: !task.published })
    } catch (err) {
      alert(err.message)
    }
  }

  if (!classes.length) {
    return <p className="text-gray-500 text-sm">You need an admin-assigned class before adding tasks.</p>
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
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235] transition-colors"
            >
              <FaPlus /> New assignment
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-xl p-5 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Due date</label>
                  <input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Max points</label>
                    <input
                      type="number"
                      min={1}
                      value={form.points_max}
                      onChange={(e) => setForm((f) => ({ ...f, points_max: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                      Pass threshold (pts)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.pass_threshold}
                      onChange={(e) => setForm((f) => ({ ...f, pass_threshold: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <p className="md:col-span-2 text-xs text-gray-500">
                  Students pass when score ≥ pass threshold (e.g. 60/100). Both points and pass/fail are
                  stored on each grade.
                </p>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Short description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Instructions</label>
                  <textarea
                    rows={3}
                    value={form.instructions}
                    onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Starter code</label>
                  <textarea
                    rows={4}
                    value={form.starter_code}
                    onChange={(e) => setForm((f) => ({ ...f, starter_code: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-xs"
                    placeholder="// optional starter template"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  />
                  Publish immediately (visible to students)
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm hover:bg-[#e89235] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Create assignment'}
              </button>
            </form>
          )}

          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap justify-between gap-3 hover:border-[#faa853]/30 transition-colors"
              >
                <div>
                  <p className="font-semibold text-[#2d3f5d]">{task.title}</p>
                  <p className="text-sm text-gray-500">
                    {task.points_max} pts · pass at {task.pass_threshold} pts
                    {task.deadline
                      ? ` · due ${new Date(task.deadline).toLocaleString()}`
                      : ''}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                      task.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {task.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublish(task)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    title={task.published ? 'Unpublish' : 'Publish'}
                  >
                    {task.published ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this assignment?')) deleteTask(task.id)
                    }}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No assignments for this class yet.</p>
            )}
          </ul>
        </>
      )}
    </div>
  )
}
