import {
  FaChalkboardTeacher,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa'

export default function ChildTeachersTab({ teachers }) {
  if (!teachers.length) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500">
        <FaChalkboardTeacher className="text-3xl text-gray-300 mx-auto mb-2" />
        No teachers assigned yet.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {teachers.map((t) => {
        const name =
          t.full_name ||
          `${t.first_name ?? ''} ${t.last_name ?? ''}`.trim() ||
          'Teacher'
        return (
          <li
            key={t.id}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center shrink-0">
                <FaChalkboardTeacher className="text-[#faa853]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#2d3f5d] truncate">{name}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  {t.email && (
                    <span className="flex items-center gap-1">
                      <FaEnvelope className="text-gray-400" />
                      {t.email}
                    </span>
                  )}
                  {t.phone && (
                    <span className="flex items-center gap-1">
                      <FaPhone className="text-gray-400" />
                      {t.phone}
                    </span>
                  )}
                </div>
                {t.classes?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.classes.map((c) => (
                      <span
                        key={c.id}
                        className="text-xs px-2 py-0.5 rounded bg-[#faa853]/10 text-[#2d3f5d]"
                      >
                        {c.name || 'Class'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}