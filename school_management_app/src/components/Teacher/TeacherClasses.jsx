import { FaBook, FaInfoCircle } from 'react-icons/fa'
import { classDisplayName } from '../../hooks/useTeacherDashboard'

export default function TeacherClasses({
  classes,
  onSelectClass,
  selectedClassId,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-[#fff8ef] border border-[#faa853]/30 rounded-xl p-4 flex gap-3 text-sm text-[#5c3d12]">
        <FaInfoCircle className="mt-0.5 flex-shrink-0" />
        <p>
          Classes are managed by <strong>admin</strong>. You only see classes you are assigned to.
          Pupils in each class are also assigned by admin.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
          <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
          <p>No classes assigned yet.</p>
          <p className="text-sm mt-2">Ask an administrator to add you to a class in Supabase.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {classes.map((c) => (
            <li
              key={c.id}
              className={`bg-white border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 ${
                selectedClassId === c.id ? 'border-[#faa853] ring-1 ring-[#faa853]/30' : 'border-gray-200'
              }`}
            >
              <div>
                <p className="font-semibold text-[#2d3f5d]">{classDisplayName(c)}</p>
                {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => onSelectClass(c.id)}
                className="text-sm text-[#faa853] font-medium hover:underline"
              >
                {selectedClassId === c.id ? 'Selected' : 'Select class'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
