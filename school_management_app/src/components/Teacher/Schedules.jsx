import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FaCalendarAlt,
  FaPlus,
  FaSpinner,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaEdit,
  FaTimes,
  FaUsers,
  FaChevronDown,
  FaCheck,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

const EMPTY_FORM = {
  title: '',
  description: '',
  start_at: '',
  end_at: '',
  location: '',
  class_ids: [],
}

export default function TeacherSchedules({ classes = [] }) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadSchedules = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('not-signed-in')

      const { data, error: err } = await supabase
        .from('schedules')
        .select(`
          *,
          class_schedules (
            id,
            class_id,
            class:class_id (id, name, status)
          )
        `)
        .eq('teacher_id', user.id)
        .order('start_at', { ascending: true })
      if (err) throw err
      setSchedules(data || [])
    } catch (e) {
      console.error('[TeacherSchedules] load failed:', e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSchedules()
  }, [loadSchedules])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(schedule) {
    setEditingId(schedule.id)
    setForm({
      title: schedule.title,
      description: schedule.description || '',
      start_at: toLocalInput(schedule.start_at),
      end_at: schedule.end_at ? toLocalInput(schedule.end_at) : '',
      location: schedule.location || '',
      class_ids: (schedule.class_schedules || []).map((cs) => cs.class_id),
    })
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!form.title.trim()) {
      return setFormError('Please enter a title.')
    }
    if (!form.start_at) {
      return setFormError('Please choose a start date and time.')
    }
    if (form.class_ids.length === 0) {
      return setFormError('Please choose at least one class.')
    }
    if (
      form.end_at &&
      new Date(form.end_at).getTime() < new Date(form.start_at).getTime()
    ) {
      return setFormError('End time must be after the start time.')
    }

    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('not-signed-in')

      const payload = {
        teacher_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        start_at: new Date(form.start_at).toISOString(),
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        location: form.location.trim() || null,
      }

      let scheduleId = editingId
      if (editingId) {
        const { error: upErr } = await supabase
          .from('schedules')
          .update(payload)
          .eq('id', editingId)
        if (upErr) throw upErr
      } else {
        const { data: ins, error: insErr } = await supabase
          .from('schedules')
          .insert(payload)
          .select('id')
          .single()
        if (insErr) throw insErr
        scheduleId = ins.id
      }

      const { data: existingLinks } = await supabase
        .from('class_schedules')
        .select('id, class_id')
        .eq('schedule_id', scheduleId)

      const existingIds = new Set((existingLinks || []).map((l) => l.class_id))
      const desiredIds = new Set(form.class_ids)

      const toAdd = [...desiredIds].filter((id) => !existingIds.has(id))
      const toRemove = (existingLinks || []).filter(
        (l) => !desiredIds.has(l.class_id),
      )

      if (toAdd.length > 0) {
        const { error: addErr } = await supabase
          .from('class_schedules')
          .insert(toAdd.map((class_id) => ({ class_id, schedule_id: scheduleId })))
        if (addErr) throw addErr
      }
      if (toRemove.length > 0) {
        const { error: rmErr } = await supabase
          .from('class_schedules')
          .delete()
          .in('id', toRemove.map((l) => l.id))
        if (rmErr) throw rmErr
      }

      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      await loadSchedules()
    } catch (e) {
      console.error('[TeacherSchedules] save failed:', e)
      setFormError('Could not save the schedule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(schedule) {
    if (
      !window.confirm(
        `Delete "${schedule.title}"? It will be removed from all classes.`,
      )
    )
      return
    setBusyId(schedule.id)
    try {
      const { error: err } = await supabase
        .from('schedules')
        .delete()
        .eq('id', schedule.id)
      if (err) throw err
      await loadSchedules()
    } catch (e) {
      console.error('[TeacherSchedules] delete failed:', e)
      alert('Could not delete the schedule. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2d3f5d] flex items-center gap-2">
            <FaCalendarAlt className="text-[#faa853]" />
            Schedules
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Post schedules to one or more of your classes
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235]"
        >
          <FaPlus /> New schedule
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-[#faa853] text-2xl" />
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Could not load schedules.{' '}
          <button onClick={loadSchedules} className="ml-1 underline">
            Try again
          </button>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
          <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
          <p>No schedules yet.</p>
          <p className="text-sm mt-1">
            Create your first schedule to share with your classes.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {schedules.map((s) => (
            <li
              key={s.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#faa853]/40 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#2d3f5d]">{s.title}</p>
                  {s.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {new Date(s.start_at).toLocaleString()}
                      {s.end_at &&
                        ` → ${new Date(s.end_at).toLocaleTimeString()}`}
                    </span>
                    {s.location && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt /> {s.location}
                      </span>
                    )}
                  </div>

                  {(s.class_schedules?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.class_schedules.map((cs) => (
                        <span
                          key={cs.id}
                          className="text-xs px-2 py-0.5 bg-[#faa853]/10 text-[#2d3f5d] rounded"
                        >
                          {cs.class?.name || 'Class'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    disabled={busyId === s.id}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <ScheduleModal
          editing={Boolean(editingId)}
          form={form}
          setForm={setForm}
          classes={classes}
          saving={saving}
          error={formError}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  )
}

/* ---------------- Modal ---------------- */

function ScheduleModal({
  editing,
  form,
  setForm,
  classes,
  saving,
  error,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-[#2d3f5d]">
            {editing ? 'Edit schedule' : 'New schedule'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#faa853] outline-none"
              placeholder="e.g. Python Basics — Session 4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                Starts *
              </label>
              <input
                type="datetime-local"
                required
                value={form.start_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_at: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
                Ends (optional)
              </label>
              <input
                type="datetime-local"
                value={form.end_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_at: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
              Location (optional)
            </label>
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Room, link, or venue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
              placeholder="What this session covers…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d3f5d] mb-1">
              Attach to classes *
            </label>
            <ClassMultiSelect
              classes={classes}
              selected={form.class_ids}
              onChange={(ids) => setForm((f) => ({ ...f, class_ids: ids }))}
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm hover:bg-[#e89235] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------------- Multi-class dropdown ---------------- */

function ClassMultiSelect({ classes, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const selectedLabels = classes
    .filter((c) => selected.includes(c.id))
    .map((c) => c.name || 'Class')

  function toggle(id) {
    onChange(
      selected.includes(id)
        ? selected.filter((c) => c !== id)
        : [...selected, id],
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50"
      >
        <span className="flex items-center gap-2 truncate">
          <FaUsers className="text-[#faa853] shrink-0" />
          {selectedLabels.length === 0 ? (
            <span className="text-gray-500">Choose one or more classes…</span>
          ) : (
            <span className="text-[#2d3f5d] truncate">
              {selectedLabels.join(', ')}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selected.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#faa853]/10 text-[#faa853] font-medium">
              {selected.length}
            </span>
          )}
          <FaChevronDown
            className={`text-gray-400 text-xs transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {classes.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500 text-center">
              No classes assigned yet.
            </p>
          ) : (
            <ul className="py-1">
              {classes.map((c) => {
                const checked = selected.includes(c.id)
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${
                        checked
                          ? 'bg-[#faa853]/5 text-[#2d3f5d]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          checked
                            ? 'bg-[#faa853] border-[#faa853]'
                            : 'border-gray-300'
                        }`}
                      >
                        {checked && <FaCheck className="text-white text-[10px]" />}
                      </span>
                      <span className="truncate">{c.name || 'Class'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function toLocalInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}