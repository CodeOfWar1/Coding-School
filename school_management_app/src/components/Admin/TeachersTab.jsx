import { useState } from 'react'
import { FaChalkboardTeacher, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

export default function TeachersTab({
  classId, classTeachers, allTeachers, reload,
}) {
  const [addTeacherId, setAddTeacherId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const existingIds = new Set(classTeachers.map(ct => ct.teacher_id))
  const options = allTeachers.filter(t => !existingIds.has(t.id))

  const handleAdd = async () => {
    if (!addTeacherId) return
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase.from('class_teachers').insert({
        class_id: classId,
        teacher_id: addTeacherId,
      })
      if (error) throw error
      setAddTeacherId('')
      await reload()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to add teacher')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (row) => {
    if (!window.confirm('Remove this teacher from the class?')) return
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('class_teachers')
        .delete()
        .eq('id', row.id)
      if (error) throw error
      await reload()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to remove teacher')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
          <FaChalkboardTeacher className="text-[#faa853]" />
          Teachers ({classTeachers.length})
        </h3>
        <div className="flex gap-2">
          <select
            value={addTeacherId}
            onChange={e => setAddTeacherId(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
          >
            <option value="">Select teacher…</option>
            {options.map(t => (
              <option key={t.id} value={t.id}>
                {t.full_name ||
                  `${t.first_name ?? ''} ${t.last_name ?? ''}`.trim() ||
                  t.email}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!addTeacherId || busy}
            className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 text-sm flex items-center gap-1"
          >
            {busy ? <FaSpinner className="animate-spin" /> : <FaPlus className="text-xs" />}
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {classTeachers.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No teachers assigned to this class yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Email</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classTeachers.map(row => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#2d3f5d]">
                    {row.teacher?.full_name ||
                      `${row.teacher?.first_name ?? ''} ${row.teacher?.last_name ?? ''}`.trim() ||
                      '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.teacher?.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(row)}
                      disabled={busy}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <FaTrash className="text-xs" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}