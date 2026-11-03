import { useState } from 'react'
import {
  FaPlus,
  FaClipboardList,
  FaBook,
  FaCode,
  FaFilePdf,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import AssignmentModal from './AssignmentModal'

export default function AssignmentsTab({ classId, assignments, reload }) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function togglePublish(a) {
    setBusyId(a.id)
    try {
      const { error } = await supabase
        .from('coding_tasks')
        .update({ published: !a.published })
        .eq('id', a.id)
      if (error) throw error
      await reload()
    } catch (e) {
      console.error(e)
      alert('Failed to update assignment')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(a) {
    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return
    setBusyId(a.id)
    try {
      // Optional: also delete the file if attached
      if (a.attachment_url) {
        const path = a.attachment_url.split('/assignments/')[1]
        if (path) {
          await supabase.storage.from('assignments').remove([path])
        }
      }
      const { error } = await supabase
        .from('coding_tasks')
        .delete()
        .eq('id', a.id)
      if (error) throw error
      await reload()
    } catch (e) {
      console.error(e)
      alert('Failed to delete assignment')
    } finally {
      setBusyId(null)
    }
  }

  async function viewAttachment(a) {
    if (!a.attachment_url) return
    const path = a.attachment_url.split('/assignments/')[1]
    if (!path) return window.open(a.attachment_url, '_blank')
    const { data, error } = await supabase.storage
      .from('assignments')
      .createSignedUrl(path, 60 * 60)
    if (error) return alert('Could not open file: ' + error.message)
    window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
          <FaClipboardList className="text-[#faa853]" />
          Assignments ({assignments.length})
        </h3>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] text-sm flex items-center gap-2"
        >
          <FaPlus className="text-xs" /> New assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
          <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
          <p>No assignments yet.</p>
          <p className="text-sm mt-2">
            Create the first assignment for this class.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {assignments.map((a) => (
            <AssignmentRow
              key={a.id}
              assignment={a}
              busy={busyId === a.id}
              onTogglePublish={() => togglePublish(a)}
              onEdit={() => {
                setEditing(a)
                setShowModal(true)
              }}
              onDelete={() => handleDelete(a)}
              onViewFile={() => viewAttachment(a)}
            />
          ))}
        </ul>
      )}

      {showModal && (
        <AssignmentModal
          classId={classId}
          assignment={editing}
          onClose={() => {
            setShowModal(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setShowModal(false)
            setEditing(null)
            await reload()
          }}
        />
      )}
    </div>
  )
}

function AssignmentRow({
  assignment,
  busy,
  onTogglePublish,
  onEdit,
  onDelete,
  onViewFile,
}) {
  const isReading = assignment.assignment_type === 'reading'
  const typeLabel = isReading ? 'Reading' : 'Coding'
  const TypeIcon = isReading ? FaBook : FaCode

  return (
    <li className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isReading
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              <TypeIcon className="text-xs" /> {typeLabel}
            </span>
            <h4 className="font-semibold text-[#2d3f5d]">{assignment.title}</h4>
            {assignment.published ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <FaEye className="text-xs" /> Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <FaEyeSlash className="text-xs" /> Draft
              </span>
            )}
          </div>

          {assignment.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {assignment.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            {assignment.deadline && (
              <span className="flex items-center gap-1">
                <FaCalendarAlt /> Due{' '}
                {new Date(assignment.deadline).toLocaleString()}
              </span>
            )}
            {assignment.attachment_url && (
              <button
                onClick={onViewFile}
                className="flex items-center gap-1 text-[#faa853] hover:underline"
              >
                <FaFilePdf /> {assignment.attachment_name || 'Attachment'}
              </button>
            )}
            {isReading && assignment.content && (
              <span className="text-gray-400">Includes reading content</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePublish}
            disabled={busy}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              assignment.published
                ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {assignment.published ? (
              <>
                <FaEyeSlash className="text-xs" /> Unpublish
              </>
            ) : (
              <>
                <FaEye className="text-xs" /> Publish
              </>
            )}
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <FaTrash className="text-xs" /> Delete
          </button>
        </div>
      </div>
    </li>
  )
}