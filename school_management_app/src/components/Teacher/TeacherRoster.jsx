import { FaUsers } from 'react-icons/fa'
import TeacherClassPicker from './TeacherClassPicker'
import { classDisplayName } from '../../hooks/useTeacherDashboard'

export default function TeacherRoster({
  classes,
  selectedClassId,
  setSelectedClassId,
  selectedClass,
  pupils,
}) {
  const displayName = (row) => {
    const p = row.profile
    if (p?.full_name) return p.full_name
    if (p?.first_name || p?.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim()
    return p?.email || 'Pupil'
  }

  if (!classes.length) {
    return (
      <p className="text-gray-500 text-sm">
        No classes assigned. An admin must add you to a class before you can view pupils.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <TeacherClassPicker
        classes={classes}
        selectedClassId={selectedClassId}
        onSelect={setSelectedClassId}
      />

      {!selectedClassId ? (
        <p className="text-gray-500 text-sm">Select a class to view pupils.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
              <FaUsers className="text-[#faa853]" />
              Pupils — {classDisplayName(selectedClass)} ({pupils.length})
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Roster is managed by admin (class_students). Read-only for teachers.
            </p>
          </div>
          {pupils.length === 0 ? (
            <p className="p-6 text-sm text-gray-500 text-center">No pupils in this class yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pupils.map((row) => (
                <li key={row.id} className="px-4 py-3">
                  <p className="font-medium text-[#2d3f5d]">{displayName(row)}</p>
                  <p className="text-xs text-gray-500">{row.profile?.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
