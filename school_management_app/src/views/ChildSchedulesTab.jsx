import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaChalkboardTeacher,
} from 'react-icons/fa'

function toHref(location) {
  if (!location) return null
  const t = location.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  if (/^[^\s]+\.[^\s]{2,}(\/\S*)?$/i.test(t)) return `https://${t}`
  return null
}

export default function ChildSchedulesTab({ schedules }) {
  if (!schedules.length) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500">
        <FaCalendarAlt className="text-3xl text-gray-300 mx-auto mb-2" />
        No schedules yet.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {schedules.map((s) => {
        const href = toHref(s.location)
        const teacher =
          s.teacher?.full_name ||
          `${s.teacher?.first_name ?? ''} ${
            s.teacher?.last_name ?? ''
          }`.trim() ||
          null
        return (
          <li
            key={`${s.id}-${s.klass?.id}`}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <div className="min-w-0">
              <p className="font-medium text-[#2d3f5d] truncate">{s.title}</p>
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
                  href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#faa853] hover:underline"
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
                {teacher && (
                  <span className="flex items-center gap-1">
                    <FaChalkboardTeacher className="text-[#faa853]" />
                    {teacher}
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}