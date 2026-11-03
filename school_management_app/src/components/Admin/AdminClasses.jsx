import { useEffect, useState } from 'react'
import {
  FaSpinner, FaPlus, FaUsers, FaBook, FaEye, FaArrowLeft,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import ClassDetail from './ClassDetail'
import StatusBadge from './StatusBadge'

const EMPTY_FORM = {
  name: '',
  description: '',
  capacity: '',
  status: 'active',
}

export default function AdminClasses() {
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { fetchClasses() }, [])

  async function fetchClasses() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          class_courses ( id, course_id ),
          class_students ( id, student_user_id )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      setClasses(data || [])
    } catch (e) {
      console.error('Error loading classes:', e)
      setError(e.message || 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  function openClass(id) {
    setSelectedClassId(id)
    setView('detail')
  }

  function closeDetail() {
    setSelectedClassId(null)
    setView('list')
    fetchClasses()
  }

  // ----- Detail view -----
  if (view === 'detail' && selectedClassId) {
    return <ClassDetail classId={selectedClassId} onBack={closeDetail} />
  }

  // ----- List view -----
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#2d3f5d]">
            Classes {!loading && <span className="text-gray-400 font-normal">({classes.length})</span>}
          </h2>
          <p className="text-sm text-gray-500">
            Manage classes, courses, teachers and students
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchClasses}
            disabled={loading}
            className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] text-sm flex items-center gap-1"
          >
            <FaPlus className="text-xs" /> New class
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateClassForm
          onCancel={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false)
            await fetchClasses()
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState onNew={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-3">
          {classes.map(c => (
            <ClassRow key={c.id} klass={c} onOpen={() => openClass(c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Row ---------- */

function ClassRow({ klass, onOpen }) {
  const studentCount = klass.class_students?.length ?? 0
  const courseCount = klass.class_courses?.length ?? 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#faa853]/40 transition-all">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex-1 cursor-pointer" onClick={onOpen}>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-semibold text-[#2d3f5d]">{klass.name}</h3>
            <StatusBadge status={klass.status} />
            {klass.capacity ? (
              <span className="text-xs text-gray-500">
                Capacity {klass.capacity}
              </span>
            ) : null}
          </div>
          {klass.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{klass.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FaUsers className="text-[#faa853] text-xs" />
              {studentCount} student{studentCount === 1 ? '' : 's'}
            </span>
            <span className="flex items-center gap-1">
              <FaBook className="text-[#faa853] text-xs" />
              {courseCount} course{courseCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <button
          onClick={onOpen}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
        >
          <FaEye className="text-xs" /> View
        </button>
      </div>
    </div>
  )
}

/* ---------- Create form ---------- */

function CreateClassForm({ onCancel, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const { error } = await supabase.from('classes').insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        // Status is always 'active' on create; can be updated later in detail view.
        status: 'active',
      })
      if (error) throw error
      setForm(EMPTY_FORM)
      await onCreated()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to create class')
    } finally {
      setCreating(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          placeholder="Class name *"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
        />
        <input
          type="number"
          min="1"
          placeholder="Capacity (optional)"
          value={form.capacity}
          onChange={e => setForm({ ...form, capacity: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
        />
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={creating || !form.name.trim()}
          className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 text-sm flex items-center gap-2"
        >
          {creating && <FaSpinner className="animate-spin" />}
          Create class
        </button>
      </div>
    </form>
  )
}

/* ---------- Empty ---------- */

function EmptyState({ onNew }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
      <p className="text-gray-600 font-medium">No classes yet</p>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Create your first class to start assigning courses, teachers and students.
      </p>
    </div>
  )
}