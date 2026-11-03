import { useEffect, useState } from 'react'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaSpinner,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

export default function ClassStudentsList({ students }) {
  const [parentMap, setParentMap] = useState({})
  const [loadingParents, setLoadingParents] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const parentIds = [
      ...new Set(
        (students || [])
          .map((s) => s.profile?.parent_id)
          .filter(Boolean),
      ),
    ]

    if (parentIds.length === 0) {
      setParentMap({})
      return
    }

    let cancelled = false
    setLoadingParents(true)
    setError(null)

    ;(async () => {
      try {
        const { data, error: parErr } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, full_name, email, phone')
          .in('id', parentIds)

        if (parErr) throw parErr
        if (cancelled) return

        setParentMap(
          Object.fromEntries((data || []).map((p) => [p.id, p])),
        )
      } catch (e) {
        console.error('Failed to load parents:', e)
        if (!cancelled) setError(e.message || 'Failed to load parents')
      } finally {
        if (!cancelled) setLoadingParents(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [students])

  if (!students || students.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
        <FaUser className="text-4xl text-gray-300 mx-auto mb-3" />
        <p>No students enrolled in this class yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {loadingParents && (
        <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500 flex items-center gap-2">
          <FaSpinner className="animate-spin text-[#faa853]" />
          Loading parent details…
        </div>
      )}
      {error && (
        <div className="px-4 py-2 border-b border-red-100 bg-red-50 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Pupil
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Parent
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Parent email
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">
                Parent phone
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const pupil = s.profile
              const parent = pupil?.parent_id
                ? parentMap[pupil.parent_id] || null
                : null

              return (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#2d3f5d]">
                    <span className="flex items-center gap-2">
                      <FaUser className="text-[#faa853] text-xs" />
                      {pupilName(pupil)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {parent ? parentName(parent) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {parent?.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {parent?.phone || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function pupilName(p) {
  if (!p) return 'Pupil'
  return (
    p.full_name ||
    [p.first_name, p.last_name].filter(Boolean).join(' ').trim() ||
    p.email ||
    'Pupil'
  )
}

function parentName(p) {
  if (!p) return '—'
  return (
    p.full_name ||
    [p.first_name, p.last_name].filter(Boolean).join(' ').trim() ||
    p.email ||
    '—'
  )
}