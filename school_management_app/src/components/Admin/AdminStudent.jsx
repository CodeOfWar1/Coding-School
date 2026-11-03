import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaSpinner, FaEye, FaUserGraduate } from 'react-icons/fa'
import StudentDetailModal from './StudentDetailsModal'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [studentEnrollments, setStudentEnrollments] = useState([])
  const [parentPayments, setParentPayments] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchAvailableCourses()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      // Fetch students + their own profile. Parent is fetched on demand.
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:student_id (*)
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
    const parentId = student.profile?.parent_id ?? null

    // 1) enrollments (each has course_id)
    const enrollmentsPromise = supabase
      .from('enrollments')
      .select(`
        *,
        course:course_id (*)
      `)
      .eq('student_id', student.id)

    // 2) parent profile (for the Parent info tab)
    const parentPromise = parentId
      ? supabase.from('profiles').select('*').eq('id', parentId).single()
      : Promise.resolve({ data: null, error: null })

    const [enrollmentsRes, parentRes] = await Promise.all([
      enrollmentsPromise,
      parentPromise,
    ])

    const enrollments = enrollmentsRes.data || []
    const courseIds = enrollments.map((e) => e.course_id).filter(Boolean)

    // 3) payments — direct filter by course_id + parent_id
    let payments = []
    if (parentId && courseIds.length > 0) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('parent_id', parentId)
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
      payments = data || []
    }

    setSelectedStudent({ ...student, parent: parentRes.data })
    setStudentEnrollments(enrollments)
    setParentPayments(payments)
    setShowDetailsModal(true)
  }

  const handleEnrollStudent = async ({ courseId }) => {
    if (!courseId) {
      alert('Please select a course')
      return
    }

    setProcessing(true)
    try {
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', selectedStudent.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (existing) {
        alert('Student is already enrolled in this course')
        return
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: selectedStudent.id,
          course_id: courseId,
          enrolled_date: new Date().toISOString().split('T')[0],
          status: 'active',
        })

      if (error) throw error

      await fetchStudentDetails(selectedStudent)
      alert('Student enrolled successfully!')
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert('Error enrolling student')
    } finally {
      setProcessing(false)
    }
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
                      {student.profile?.full_name ||
                        `${student.profile?.first_name ?? ''} ${student.profile?.last_name ?? ''}`.trim()}
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

      {showDetailsModal && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          enrollments={studentEnrollments}
          payments={parentPayments}
          availableCourses={availableCourses}
          processing={processing}
          onClose={() => setShowDetailsModal(false)}
          onEnroll={handleEnrollStudent}
        />
      )}
    </>
  )
}