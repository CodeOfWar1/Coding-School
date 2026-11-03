import { useState } from 'react'
import {
  FaTimes,
  FaSpinner,
  FaBook,
  FaCode,
  FaFilePdf,
  FaUpload,
  FaTrash,
  FaCheckCircle,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

const EMPTY = {
  title: '',
  description: '',
  instructions: '',
  assignment_type: 'reading',
  content: '',
  starter_code: '',
  points_max: 100,
  pass_threshold: 60,
  deadline: '',
  published: false,
}

export default function AssignmentModal({
  classId,
  assignment,
  onClose,
  onSaved,
}) {
  const isEdit = Boolean(assignment)
  const [form, setForm] = useState(
    isEdit
      ? {
          ...EMPTY,
          ...assignment,
          deadline: assignment.deadline
            ? toLocalInput(assignment.deadline)
            : '',
        }
      : EMPTY,
  )
  const [file, setFile] = useState(null)
  const [removeExistingFile, setRemoveExistingFile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isReading = form.assignment_type === 'reading'

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }))
    setError('')
  }

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('PDF must be under 10 MB')
      return
    }
    setFile(f)
    setRemoveExistingFile(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required')
    if (isReading && !form.content.trim() && !file && !form.attachment_url)
      return setError('Add reading content or upload a PDF')
    if (!isReading && !form.starter_code.trim() && !file && !form.attachment_url)
      return setError('Add starter code or upload a PDF')

    setSaving(true)
    setError('')
    try {
      const { data: userData } = await supabase.auth.getUser()
      const teacherId = userData?.user?.id
      if (!teacherId) throw new Error('You must be logged in')

      let attachment_url = form.attachment_url || null
      let attachment_name = form.attachment_name || null

      // Handle file upload / replacement / removal
      if (removeExistingFile && attachment_url) {
        const path = attachment_url.split('/assignments/')[1]
        if (path) await supabase.storage.from('assignments').remove([path])
        attachment_url = null
        attachment_name = null
      }

      if (file) {
        if (attachment_url) {
          // replace old file
          const oldPath = attachment_url.split('/assignments/')[1]
          if (oldPath) await supabase.storage.from('assignments').remove([oldPath])
        }
        const ext = file.name.split('.').pop()
        const path = `${teacherId}/${crypto.randomUUID()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('assignments')
          .upload(path, file, { contentType: 'application/pdf', upsert: false })
        if (uploadErr) throw uploadErr

        const { data: signed } = await supabase.storage
          .from('assignments')
          .createSignedUrl(path, 60 * 60 * 24 * 365) // 1y

        attachment_url = signed?.signedUrl || null
        // We store the path in attachment_name too for later deletion
        attachment_name = file.name
      }

      const payload = {
        class_id: classId,
        teacher_id: teacherId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        instructions: form.instructions.trim() || null,
        assignment_type: form.assignment_type,
        content: isReading ? form.content.trim() || null : null,
        starter_code: !isReading ? form.starter_code || null : null,
        points_max: Number(form.points_max) || 100,
        pass_threshold: Number(form.pass_threshold) || 60,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        published: Boolean(form.published),
        attachment_url,
        attachment_name,
      }

      if (isEdit) {
        const { error: updErr } = await supabase
          .from('coding_tasks')
          .update(payload)
          .eq('id', assignment.id)
        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase
          .from('coding_tasks')
          .insert(payload)
        if (insErr) throw insErr
      }

      await onSaved()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

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
            {isEdit ? 'Edit assignment' : 'New assignment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-[#2d3f5d] mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <TypeButton
                active={isReading}
                icon={<FaBook />}
                label="Reading"
                desc="Text or PDF to read"
                onClick={() => update({ assignment_type: 'reading' })}
              />
              <TypeButton
                active={!isReading}
                icon={<FaCode />}
                label="Coding"
                desc="Starter code or PDF"
                onClick={() => update({ assignment_type: 'coding' })}
              />
            </div>
          </div>

          {/* Title */}
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Introduction to Loops"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
              required
            />
          </Field>

          {/* Description */}
          <Field label="Short description">
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
              placeholder="A one-line summary for students"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          </Field>

          {/* Reading content / Coding starter */}
          {isReading ? (
            <Field label="Reading content">
              <textarea
                value={form.content}
                onChange={(e) => update({ content: e.target.value })}
                rows={6}
                placeholder="Paste the reading material here…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </Field>
          ) : (
            <>
              <Field label="Starter code">
                <textarea
                  value={form.starter_code}
                  onChange={(e) => update({ starter_code: e.target.value })}
                  rows={6}
                  placeholder="// starter code goes here…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Max points">
                  <input
                    type="number"
                    min="1"
                    value={form.points_max}
                    onChange={(e) => update({ points_max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </Field>
                <Field label="Pass threshold">
                  <input
                    type="number"
                    min="1"
                    value={form.pass_threshold}
                    onChange={(e) => update({ pass_threshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </Field>
              </div>
            </>
          )}

          {/* Instructions */}
          <Field label="Instructions (optional)">
            <textarea
              value={form.instructions}
              onChange={(e) => update({ instructions: e.target.value })}
              rows={3}
              placeholder="What students need to do…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </Field>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-[#2d3f5d] mb-2">
              PDF attachment (optional)
            </label>

            {form.attachment_url && !removeExistingFile && !file && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-2">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <FaFilePdf className="text-red-500" />
                  {form.attachment_name || 'attached.pdf'}
                </span>
                <button
                  type="button"
                  onClick={() => setRemoveExistingFile(true)}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <FaTrash className="text-xs" /> Remove
                </button>
              </div>
            )}

            {file && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2">
                <span className="flex items-center gap-2 text-sm text-blue-800">
                  <FaFilePdf /> {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-blue-700 hover:text-blue-900 text-sm flex items-center gap-1"
                >
                  <FaTrash className="text-xs" /> Discard
                </button>
              </div>
            )}

            {!file && !form.attachment_url && (
              <label className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:border-[#faa853] text-sm text-gray-500">
                <FaUpload className="text-[#faa853]" />
                Choose a PDF (max 10 MB)
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Deadline */}
          <Field label="Deadline (optional)">
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => update({ deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </Field>

          {/* Published */}
          <label className="flex items-center gap-2 text-sm text-[#2d3f5d] cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update({ published: e.target.checked })}
              className="w-4 h-4 accent-[#faa853]"
            />
            Publish immediately (students can see it)
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCheckCircle />
              )}
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function TypeButton({ active, icon, label, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-3 rounded-lg border transition-colors ${
        active
          ? 'border-[#faa853] bg-[#faa853]/5'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div
        className={`flex items-center gap-2 font-medium text-sm ${
          active ? 'text-[#faa853]' : 'text-[#2d3f5d]'
        }`}
      >
        {icon} {label}
      </div>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </button>
  )
}

function toLocalInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}