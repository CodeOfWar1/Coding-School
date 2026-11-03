import { useEffect, useMemo, useState } from 'react'
import { FaSpinner, FaCheckCircle } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

export default function AddStudentForm({
  classId, classCourses, existingStudentIds, onDone, onCancel,
}) {
  const courseIds = useMemo(
    () => classCourses.map(cc => cc.course_id),
    [classCourses]
  )

  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (courseIds.length === 0) { setCandidates([]); setLoading(false); return }
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            student_id,
            course_id,
            student:student_id (
              id,
              profile:student_id (
                id, email, first_name, last_name, full_name, avatar_url
              )
            )
          `)
          .in('course_id', courseIds)
        if (error) throw error

        // unique by profile id, exclude already-in-class
        const byProfile = new Map()
        for (const row of data || []) {
          const profile = row.student?.profile
          if (!profile?.id) continue
          if (existingStudentIds.has(profile.id)) continue
          if (!byProfile.has(profile.id)) {
            byProfile.set(profile.id, { profile, courseIds: new Set([row.course_id]) })
          } else {
            byProfile.get(profile.id).courseIds.add(row.course_id)
          }
        }
        if (!cancelled) setCandidates(Array.from(byProfile.values()))
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Failed to load eligible students')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [courseIds, existingStudentIds])

  const handleAdd = async () => {
    if (!selectedId) return
    setSubmitting(true)
    setError('')
    try {
      const { error } = await supabase
        .from('class_students')
        .insert({ class_id: classId, student_user_id: selectedId })
      if (error) throw error
      setSelectedId('')
      await onDone()
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to add student')
    } finally {
      setSubmitting(false)
    }
  }

  if (courseIds.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">
        Add at least one course to this class before adding students.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <p className="text-sm text-gray-600">
        Only students enrolled in one of this class's courses are shown.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FaSpinner className="animate-spin" /> Loading eligible students…
        </div>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-gray-500">No eligible students available.</p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
          >
            <option value="">Choose a student…</option>
            {candidates.map(({ profile, courseIds: matched }) => {
              const name = profile.full_name ||
                `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
              return (
                <option key={profile.id} value={profile.id}>
                  {name} — {profile.email} ({matched.size} matching course{matched.size > 1 ? 's' : ''})
                </option>
              )
            })}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedId || submitting}
            className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            Add
          </button>
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}