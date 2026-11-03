import { useCallback, useEffect, useState } from 'react'
import {
  FaCalendarAlt,
  FaSpinner,
  FaClock,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
} from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

function toHref(location) {
  if (!location) return null
  const trimmed = location.trim()
  if (!trimmed) return null

  // Explicit protocol
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  // Looks like a domain (has a dot, no spaces) e.g. zoom.us/j/123, meet.google.com/abc
  if (/^[^\s]+\.[^\s]{2,}(\/\S*)?$/i.test(trimmed)) {
    return `https://${trimmed}`
  }

  // Anything else is plain text (Room 3B, Main Hall, etc.)
  return null
}

export default function StudentSchedules({ studentId }) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [rows, setRows] = useState([])

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setLoadError(false)
    try {
      const { data: classStudents, error: csErr } = await supabase
        .from('class_students')
        .select('class_id, class:class_id (id, name)')
        .eq('student_user_id', studentId)
      if (csErr) throw csErr

      const classIds = (classStudents || []).map((r) => r.class_id)
      if (classIds.length === 0) {
        setRows([])
        return
      }

      const { data, error: err } = await supabase
        .from('class_schedules')
        .select(`
          id,
          class:class_id (id, name),
          schedule:schedule_id (
            id, title, description, start_at, end_at, location
          )
        `)
        .in('class_id', classIds)
      if (err) throw err

      const scheduleRows = (data || [])
        .map((r) => ({ ...r.schedule, klass: r.class }))
        .filter((s) => s.id)
        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))

      setRows(scheduleRows)
    } catch (e) {
      console.error('[StudentSchedules] load failed:', e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">
          Could not load your schedules.
        </p>
        <button onClick={load} className="mt-3 text-sm text-red-700 underline">
          Try again
        </button>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-[#2d3f5d] font-medium">No schedules yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Your teacher hasn't posted any schedules for your classes yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rows.map((s) => {
        const href = toHref(s.location)
        return (
          <div
            key={`${s.id}-${s.klass?.id}`}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#2d3f5d]">{s.title}</p>
                {s.description && (
                  <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaClock />
                    {new Date(s.start_at).toLocaleString()}
                    {s.end_at &&
                      ` → ${new Date(s.end_at).toLocaleTimeString()}`}
                  </span>

                  {s.location && (
                    href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#faa853] hover:underline font-medium"
                      >
                        <FaMapMarkerAlt />
                        {s.location}
                        <FaExternalLinkAlt className="text-[10px] opacity-70" />
                      </a>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt /> {s.location}
                      </span>
                    )
                  )}

                  {s.klass?.name && (
                    <span className="px-2 py-0.5 rounded bg-[#faa853]/10 text-[#2d3f5d]">
                      {s.klass.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}