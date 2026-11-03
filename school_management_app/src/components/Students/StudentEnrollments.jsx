import {
  FaBook,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaClock,
  FaCalendarCheck,
} from 'react-icons/fa'

export default function StudentEnrollments({ enrollments = [] }) {
  if (!enrollments.length) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-[#2d3f5d] font-medium">No Courses yet</p>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Your Courses will appear here once your enrollment is confirmed.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
          <FaBook className="text-[#faa853]" />
          My Courses ({enrollments.length})
        </h3>
      </div>

      <ul className="divide-y divide-gray-100">
        {enrollments.map((enrollment) => {
          const isActive = enrollment.status === 'active'
          return (
            <li
              key={enrollment.id}
              className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-[#2d3f5d] truncate">
                  {enrollment.course?.course_name || 'Class'}
                </p>

                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  {enrollment.enrolled_date && (
                    <span className="flex items-center gap-1">
                      <FaCalendarCheck className="text-gray-400" />
                      Enrolled{' '}
                      {new Date(enrollment.enrolled_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isActive ? (
                  <FaCheckCircle className="text-xs" />
                ) : (
                  <FaClock className="text-xs" />
                )}
                {enrollment.status || 'active'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}