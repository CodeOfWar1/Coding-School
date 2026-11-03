import { useEffect, useMemo, useState } from 'react'
import { FaUserPlus, FaTrash, FaSpinner, FaUsers } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import AddStudentForm from './AddStudentForm'

export default function StudentsTab({
  classId, classStudents, classCourses, reload,
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const existingIds = useMemo(
    () => new Set(classStudents.map(s => s.student_user_id)),
    [classStudents]
  )

  const handleRemove = async (row) => {
    if (!window.confirm('Remove this student from the class?')) return
    setBusyId(row.id)
    try {
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('id', row.id)
      if (error) throw error
      await reload()
    } catch (e) {
      console.error(e)
      alert('Failed to remove student')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
          <FaUsers className="text-[#faa853]" />
          Students ({classStudents.length})
        </h3>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] text-sm flex items-center gap-1"
        >
          <FaUserPlus className="text-xs" /> Add student
        </button>
      </div>

      {showAdd && (
        <AddStudentForm
          classId={classId}
          classCourses={classCourses}
          existingStudentIds={existingIds}
          onDone={async () => { setShowAdd(false); await reload() }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {classStudents.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No students in this class yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Email</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Phone</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map(row => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#2d3f5d]">
                    {row.profile?.full_name ||
                      `${row.profile?.first_name ?? ''} ${row.profile?.last_name ?? ''}`.trim() ||
                      '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.profile?.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{row.profile?.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(row)}
                      disabled={busyId === row.id}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs flex items-center gap-1 ml-auto"
                    >
                      {busyId === row.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                      Remove
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