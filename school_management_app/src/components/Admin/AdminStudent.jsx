import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FaSpinner, 
  FaEye, 
  FaTimes, 
  FaBook, 
  FaCalendarAlt, 
  FaUserGraduate, 
  FaMoneyBillWave,
  FaPlus,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarCheck
} from 'react-icons/fa'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [studentEnrollments, setStudentEnrollments] = useState([])
  const [studentPayments, setStudentPayments] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchAvailableCourses()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:student_id (
            id, email, first_name, last_name, phone, date_of_birth, gender, home_address
          )
        `)
        .order('admitted_date', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('course_name')
    setAvailableCourses(data || [])
  }

  const fetchStudentDetails = async (student) => {
    setSelectedStudent(student)
    
    // Fetch enrollments with course details
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:course_id (*)
      `)
      .eq('student_id', student.id)

    setStudentEnrollments(enrollments || [])

    // Fetch payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', student.student_id)
      .order('created_at', { ascending: false })

    setStudentPayments(payments || [])
    setShowDetailsModal(true)
  }

  const handleEnrollStudent = async () => {
    if (!selectedCourseId) {
      alert('Please select a course')
      return
    }

    setEnrolling(true)
    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', selectedStudent.id)
        .eq('course_id', selectedCourseId)
        .maybeSingle()

      if (existing) {
        alert('Student is already enrolled in this course')
        return
      }

      // Enroll student
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: selectedStudent.id,
          course_id: selectedCourseId,
          enrolled_date: new Date().toISOString().split('T')[0],
          status: 'active'
        })

      if (error) throw error

      // Refresh data
      await fetchStudentDetails(selectedStudent)
      setShowEnrollModal(false)
      setSelectedCourseId('')
      alert('Student enrolled successfully!')
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert('Error enrolling student')
    } finally {
      setEnrolling(false)
    }
  }

  const calculateTotalPaid = () => {
    return studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  const getSelectedCourseDetails = () => {
    return availableCourses.find(c => c.id === selectedCourseId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#2d3f5d]">Registered Students</h2>
            <p className="text-sm text-gray-500">View and manage all enrolled students</p>
          </div>
          <button 
            onClick={fetchStudents} 
            className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors"
          >
            Refresh
          </button>
        </div>

        {students.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FaUserGraduate className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Student Name</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Admitted Date</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#2d3f5d]">
                      {student.profile?.first_name} {student.profile?.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{student.profile?.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(student.admitted_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => fetchStudentDetails(student)} 
                        className="px-3 py-1 bg-[#faa853]/10 text-[#faa853] rounded-lg hover:bg-[#faa853]/20 transition-colors text-sm flex items-center gap-1 mx-auto"
                      >
                        <FaEye className="text-xs" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal - updated to show enrollments */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
                    <FaUserGraduate className="text-[#faa853] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#2d3f5d]">Student Profile</h2>
                    <p className="text-sm text-gray-500">{selectedStudent.profile?.first_name} {selectedStudent.profile?.last_name}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Personal Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
                  <FaUserGraduate className="text-[#faa853]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <FaUserGraduate className="text-gray-400 text-xs mt-0.5" />
                    <div>
                      <p className="text-gray-500">Full Name</p>
                      <p className="font-medium text-[#2d3f5d]">{selectedStudent.profile?.first_name} {selectedStudent.profile?.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaEnvelope className="text-gray-400 text-xs mt-0.5" />
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-[#2d3f5d]">{selectedStudent.profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaPhone className="text-gray-400 text-xs mt-0.5" />
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-[#2d3f5d]">{selectedStudent.profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCalendarCheck className="text-gray-400 text-xs mt-0.5" />
                    <div>
                      <p className="text-gray-500">Admitted Date</p>
                      <p className="font-medium text-[#2d3f5d]">{new Date(selectedStudent.admitted_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-[#2d3f5d] flex items-center gap-2">
                    <FaBook className="text-[#faa853]" />
                    Enrolled Courses
                  </h3>
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] text-sm flex items-center gap-1 transition-colors"
                  >
                    <FaPlus className="text-xs" /> Enroll in Course
                  </button>
                </div>
                {studentEnrollments.length === 0 ? (
                  <div className="p-8 text-center">
                    <FaBook className="text-3xl text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No courses enrolled</p>
                    <button
                      onClick={() => setShowEnrollModal(true)}
                      className="mt-2 text-[#faa853] text-sm hover:underline"
                    >
                      Enroll now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {studentEnrollments.map(enrollment => (
                      <div key={enrollment.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-[#2d3f5d]">{enrollment.course?.course_name}</p>
                            <p className="text-sm text-gray-500">Course Code: {enrollment.course?.course_code}</p>
                            <div className="flex gap-3 mt-2 text-xs text-gray-400">
                              <span>Enrolled: {new Date(enrollment.enrolled_date).toLocaleDateString()}</span>
                              <span className="capitalize">Status: {enrollment.status}</span>
                            </div>
                          </div>
                          {enrollment.status === 'active' && (
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

              {/* Payment History */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <h3 className="font-semibold p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <FaMoneyBillWave className="text-[#faa853]" />
                  Payment History
                </h3>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="text-xl font-bold text-green-600">K{calculateTotalPaid().toFixed(2)}</span>
                  </div>
                  {studentPayments.length === 0 ? (
                    <div className="text-center py-6">
                      <FaMoneyBillWave className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No payments recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {studentPayments.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                          <div>
                            <p className="text-gray-600">{new Date(p.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400 capitalize">{p.payment_method}</p>
                          </div>
                          <span className="font-medium text-green-600">K{p.amount?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEnrollModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#2d3f5d]">Enroll in Course</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStudent.profile?.first_name} {selectedStudent.profile?.last_name}
                  </p>
                </div>
                <button onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Select Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none"
                  required
                >
                  <option value="">Choose a course...</option>
                  {availableCourses.map(course => {
                    const isEnrolled = studentEnrollments.some(e => e.course_id === course.id)
                    return (
                      <option key={course.id} value={course.id} disabled={isEnrolled}>
                        {course.course_name} - K{course.tuition_fee} {isEnrolled ? '(Already Enrolled)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {selectedCourseId && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-[#2d3f5d] mb-2">Course Details:</p>
                  <div className="space-y-1">
                    <p><span className="text-gray-500">Course Name:</span> {getSelectedCourseDetails()?.course_name}</p>
                    <p><span className="text-gray-500">Course Code:</span> {getSelectedCourseDetails()?.course_code}</p>
                    <p><span className="text-gray-500">Tuition Fee:</span> K{getSelectedCourseDetails()?.tuition_fee}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEnrollStudent}
                  disabled={enrolling || !selectedCourseId}
                  className="flex-1 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {enrolling ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="px-6 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}