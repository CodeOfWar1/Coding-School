import { FaGraduationCap, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function ChildGradesTab({ assignments }) {
  const graded = assignments.filter(
    (a) => a.submission?.status === 'graded',
  )

  if (graded.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500">
        <FaGraduationCap className="text-3xl text-gray-300 mx-auto mb-2" />
        No grades yet.
      </div>
    )
  }

  const totalScore = graded.reduce(
    (s, a) => s + Number(a.submission.score || 0),
    0,
  )
  const totalMax = graded.reduce((s, a) => s + Number(a.points_max || 0), 0)
  const passCount = graded.filter(
    (a) => a.submission.pass_fail === 'pass',
  ).length
  const percentage =
    totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Graded assignments</p>
          <p className="text-2xl font-bold text-[#2d3f5d]">
            {graded.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Passed</p>
          <p className="text-2xl font-bold text-green-700">
            {passCount} / {graded.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Overall</p>
          <p className="text-2xl font-bold text-[#2d3f5d]">{percentage}%</p>
        </div>
      </div>

      {/* Per-assignment */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {graded.map((a) => {
            const passed = a.submission.pass_fail === 'pass'
            return (
              <li
                key={a.id}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#2d3f5d] truncate">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {a.class?.name || 'Class'}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${
                    passed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {passed ? <FaCheckCircle /> : <FaTimesCircle />}
                  {a.submission.score} / {a.points_max}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}