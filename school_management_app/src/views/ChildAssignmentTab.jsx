import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from 'react-icons/fa'

export default function ChildAssignmentsTab({ assignments }) {
  if (!assignments.length) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500">
        <FaClipboardList className="text-3xl text-gray-300 mx-auto mb-2" />
        No assignments yet.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {assignments.map((a) => {
          const sub = a.submission
          return (
            <li
              key={a.id}
              className="p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-[#2d3f5d] truncate">
                  {a.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {a.class?.name || 'Class'} ·{' '}
                  {a.assignment_type === 'reading' ? 'Reading' : 'Coding'} ·{' '}
                  {a.points_max} pts
                </p>
                {a.deadline && (
                  <p className="text-xs text-gray-400 mt-1">
                    Due {new Date(a.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
              <StatusBadge submission={sub} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function StatusBadge({ submission }) {
  if (!submission) {
    return (
      <span className="shrink-0 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
        Not started
      </span>
    )
  }
  if (submission.status === 'graded') {
    const passed = submission.pass_fail === 'pass'
    return (
      <span
        className={`shrink-0 text-xs px-2 py-0.5 rounded inline-flex items-center gap-1 ${
          passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {passed ? <FaCheckCircle /> : <FaTimesCircle />}
        {passed ? 'Passed' : 'Failed'}
      </span>
    )
  }
  return (
    <span className="shrink-0 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 inline-flex items-center gap-1">
      <FaHourglassHalf /> Submitted
    </span>
  )
}