import { useMemo, useState } from 'react'
import {
  FaTimes,
  FaUserGraduate,
  FaUser,
  FaBook,
  FaMoneyBillWave,
  FaPlus,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa'

const TABS = [
  { key: 'student', label: 'Student info', icon: <FaUserGraduate /> },
  { key: 'parent', label: 'Parent info', icon: <FaUser /> },
  { key: 'courses', label: 'Courses', icon: <FaBook /> },
  { key: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> },
]

/* ---------- Shared row ---------- */

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-[#2d3f5d] break-words">{value}</p>
    </div>
  )
}

function ProfileGrid({ profile, heading, icon }) {
  if (!profile) return <p className="text-sm text-gray-500">No record found.</p>

  const displayName =
    profile.full_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() ||
    null

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
        <span className="text-[#faa853]">{icon}</span>
        {heading}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Row label="Full name" value={displayName} />
        <Row label="First name" value={profile.first_name} />
        <Row label="Last name" value={profile.last_name} />
        <Row label="Email" value={profile.email} />
        <Row label="Phone" value={profile.phone} />
        <Row label="Role" value={profile.role} />
        <Row label="Gender" value={profile.gender} />
        <Row
          label="Date of birth"
          value={
            profile.date_of_birth
              ? new Date(profile.date_of_birth).toLocaleDateString()
              : null
          }
        />
        <Row label="Home address" value={profile.home_address} />
        <Row label="Bio" value={profile.bio} />
        <Row label="Avatar URL" value={profile.avatar_url} />
        <Row label="Emergency contact name" value={profile.emergency_contact_name} />
        <Row label="Emergency contact phone" value={profile.emergency_contact_phone} />
        <Row
          label="Can use photos"
          value={
            profile.can_use_photos === null || profile.can_use_photos === undefined
              ? null
              : profile.can_use_photos
              ? 'Yes'
              : 'No'
          }
        />
        <Row
          label="Created at"
          value={profile.created_at ? new Date(profile.created_at).toLocaleString() : null}
        />
        <Row
          label="Updated at"
          value={profile.updated_at ? new Date(profile.updated_at).toLocaleString() : null}
        />
      </div>
    </div>
  )
}

/* ---------- Tabs ---------- */

function StudentInfo({ student }) {
  return (
    <div className="space-y-4">
      <ProfileGrid
        profile={student.profile}
        heading="Student Information"
        icon={<FaUserGraduate />}
      />
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-[#2d3f5d] mb-3 flex items-center gap-2">
          <FaUserGraduate className="text-[#faa853]" />
          Student Record
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Row
            label="Admitted date"
            value={
              student.admitted_date
                ? new Date(student.admitted_date).toLocaleDateString()
                : null
            }
          />
          
        </div>
      </div>
    </div>
  )
}

function ParentInfo({ student }) {
  return (
    <ProfileGrid
      profile={student.parent}
      heading="Parent Information"
      icon={<FaUser />}
    />
  )
}

function CoursesInfo({ enrollments, availableCourses, processing, onEnroll }) {
  const [courseId, setCourseId] = useState('')
  const alreadyEnrolled = useMemo(
    () => new Set(enrollments.map((e) => e.course_id)),
    [enrollments]
  )
  const selectedCourse = availableCourses.find((c) => c.id === courseId)

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-[#2d3f5d] mb-3 flex items-center gap-2">
          <FaPlus className="text-[#faa853]" />
          Enroll in a Course
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none text-sm"
          >
            <option value="">Choose a course…</option>
            {availableCourses.map((c) => {
              const enrolled = alreadyEnrolled.has(c.id)
              return (
                <option key={c.id} value={c.id} disabled={enrolled}>
                  {c.course_name} — K{c.tuition_fee} {enrolled ? '(Already enrolled)' : ''}
                </option>
              )
            })}
          </select>
          <button
            onClick={() => {
              onEnroll({ courseId })
              setCourseId('')
            }}
            disabled={!courseId || processing}
            className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
          >
            {processing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            Enroll
          </button>
        </div>
        {selectedCourse && (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-[#2d3f5d] mb-1">{selectedCourse.course_name}</p>
            <p className="text-gray-600">Code: {selectedCourse.course_code}</p>
            <p className="text-gray-600">Fee: K{selectedCourse.tuition_fee}</p>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <h3 className="font-semibold p-4 bg-gray-50 border-b flex items-center gap-2">
          <FaBook className="text-[#faa853]" />
          Enrolled Courses
        </h3>
        {enrollments.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No courses enrolled yet.
          </div>
        ) : (
          <div className="divide-y">
            {enrollments.map((en) => (
              <div key={en.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#2d3f5d]">{en.course?.course_name}</p>
                    <p className="text-sm text-gray-500">Code: {en.course?.course_code}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Enrolled: {new Date(en.enrolled_date).toLocaleDateString()} ·{' '}
                      <span className="capitalize">{en.status}</span>
                    </p>
                  </div>
                  {en.status === 'active' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <FaCheckCircle className="text-xs" /> Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PaymentsInfo({ payments, enrollments, availableCourses }) {
  const [courseId, setCourseId] = useState('') // '' = all courses

  // Courses this student is enrolled in (for the dropdown)
  const enrolledCourses = useMemo(() => {
    const ids = new Set(enrollments.map((e) => e.course_id))
    return availableCourses.filter((c) => ids.has(c.id))
  }, [enrollments, availableCourses])

  // Direct filter — payments already scoped to parent + this student's courses
  const filtered = useMemo(
    () => (courseId ? payments.filter((p) => p.course_id === courseId) : payments),
    [payments, courseId]
  )

  const totalPaid = filtered.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-[#2d3f5d] mb-3 flex items-center gap-2">
          <FaMoneyBillWave className="text-[#faa853]" />
          Filter by Course
        </h3>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none text-sm"
        >
          <option value="">All courses</option>
          {enrolledCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.course_name}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3 pb-3 border-b">
          <span className="text-gray-600 text-sm">Total Paid</span>
          <span className="text-xl font-bold text-green-600">
            K{totalPaid.toFixed(2)}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-6">
            No payments recorded for this selection.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filtered.map((p) => {
              const course = availableCourses.find((c) => c.id === p.course_id)
              return (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-sm border-b border-gray-100 pb-2"
                >
                  <div>
                    <p className="text-gray-600">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {p.payment_method} · {p.reference ?? 'no ref'}
                      {course ? ` · ${course.course_name}` : ''}
                    </p>
                  </div>
                  <span className="font-medium text-green-600">
                    K{p.amount?.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Shell ---------- */

export default function StudentDetailModal({
  student,
  enrollments,
  payments,
  availableCourses,
  processing,
  onClose,
  onEnroll,
}) {
  const [tab, setTab] = useState('student')

  const displayName =
    student.profile?.full_name ||
    [student.profile?.first_name, student.profile?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    'Student'

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
                <FaUserGraduate className="text-[#faa853] text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2d3f5d]">Student Profile</h2>
                <p className="text-sm text-gray-500">{displayName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 px-5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                tab === t.key
                  ? 'border-[#faa853] text-[#faa853]'
                  : 'border-transparent text-gray-500 hover:text-[#2d3f5d]'
              }`}
            >
              <span className="text-xs">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'student' && <StudentInfo student={student} />}
          {tab === 'parent' && <ParentInfo student={student} />}
          {tab === 'courses' && (
            <CoursesInfo
              enrollments={enrollments}
              availableCourses={availableCourses}
              processing={processing}
              onEnroll={onEnroll}
            />
          )}
          {tab === 'payments' && (
            <PaymentsInfo
              payments={payments}
              enrollments={enrollments}
              availableCourses={availableCourses}
            />
          )}
        </div>

        <div className="flex justify-end px-5 pb-5">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}