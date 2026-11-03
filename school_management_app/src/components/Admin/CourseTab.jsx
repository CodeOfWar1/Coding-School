import { useState } from 'react'
import { FaBook, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

export default function CoursesTab({
  classId, classCourses, allCourses, reload,
}) {
  const [addCourseId, setAddCourseId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const existingIds = new Set(classCourses.map(cc => cc.course_id))
  const options = allCourses.filter(c => !existingIds.has(c.id))

  const handleAdd = async () => {
    if (!addCourseId) return
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('class_courses')
        .insert({ class_id: classId, course_id: addCourseId })
      if (error) throw error
      setAddCourseId('')
      await reload()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to add course')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (row) => {
    if (!window.confirm('Remove this course from the class?')) return
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('class_courses')
        .delete()
        .eq('id', row.id)
      if (error) throw error
      await reload()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to remove course')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
          <FaBook className="text-[#faa853]" />
          Courses ({classCourses.length})
        </h3>
        <div className="flex gap-2">
          <select
            value={addCourseId}
            onChange={e => setAddCourseId(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
          >
            <option value="">Select course…</option>
            {options.map(c => (
              <option key={c.id} value={c.id}>
                {c.course_name} ({c.course_code})
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!addCourseId || busy}
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
        {classCourses.length === 0 ? (
          <div className="p-8 text-center">
            <FaBook className="text-3xl text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No courses added to this class yet.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Course</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Code</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Fee</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classCourses.map(row => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#2d3f5d]">
                    {row.course?.course_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.course?.course_code}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    K{Number(row.course?.tuition_fee ?? 0).toFixed(2)}
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