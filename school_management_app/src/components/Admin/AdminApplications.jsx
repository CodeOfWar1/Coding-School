import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaMoneyBillWave,
  FaHistory,
  FaUserCheck,
  FaHourglassHalf,
  FaTimes,
  FaCalendarAlt,
  FaBook,
  FaWallet,
  FaUser,
  FaEnvelope,
  FaClock
} from 'react-icons/fa'

export default function AdminApplications({ onRefresh }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [payments, setPayments] = useState([])
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('application')
        .select(`
          *,
          course:course_id (*),
          user:user_id (id, email, first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async (applicationId) => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
    setPayments(data || [])
  }

  const calculateTotalPaid = () => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  const calculateRemainingBalance = () => {
    const totalFee = selectedApp?.course?.tuition_fee || 0
    return totalFee - calculateTotalPaid()
  }

  const handleViewDetails = async (app) => {
    setSelectedApp(app)
    await fetchPayments(app.id)
    setShowDetailsModal(true)
  }

  const handleApprove = async (app) => {
    if (!window.confirm(`Approve application for ${app.course?.course_name}? This will create a student record and enrollment.`)) return

    setProcessingId(app.id)
    try {
      // Check if student already exists
      let { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', app.user_id)
        .maybeSingle()

      let studentId = existingStudent?.id

      if (!existingStudent) {
        // Create student record
        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert({
            student_id: app.user_id,
            admitted_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single()

        if (studentError) throw studentError
        studentId = newStudent.id
      }

      // Create enrollment for the student
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          course_id: app.course_id,
          enrolled_date: new Date().toISOString().split('T')[0],
          status: 'active'
        })

      if (enrollmentError) throw enrollmentError

      // Update application status
      const { error: appError } = await supabase
        .from('application')
        .update({ status: 'approved', progress: 'completed' })
        .eq('id', app.id)

      if (appError) throw appError

      await fetchApplications()
      if (onRefresh) onRefresh()
      alert('Application approved successfully! Student has been enrolled.')
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Error approving application')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (app) => {
    if (!window.confirm(`Reject application for ${app.course?.course_name}?`)) return

    setProcessingId(app.id)
    try {
      const { error } = await supabase
        .from('application')
        .update({ status: 'rejected' })
        .eq('id', app.id)

      if (error) throw error
      await fetchApplications()
      alert('Application rejected')
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Error rejecting application')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (app) => {
    if (app.status === 'approved') {
      return { text: 'Approved', color: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="text-xs" /> }
    }
    if (app.status === 'rejected') {
      return { text: 'Rejected', color: 'bg-red-100 text-red-700', icon: <FaTimesCircle className="text-xs" /> }
    }
    if (app.status === 'awaiting_approval') {
      return { text: 'Awaiting Approval', color: 'bg-yellow-100 text-yellow-700', icon: <FaHourglassHalf className="text-xs" /> }
    }
    if (app.progress === 'parent_details' || app.progress === 'payment') {
      return { text: 'Payment Pending', color: 'bg-blue-100 text-blue-700', icon: <FaMoneyBillWave className="text-xs" /> }
    }
    return { text: 'Pending', color: 'bg-gray-100 text-gray-700', icon: <FaClock className="text-xs" /> }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><FaSpinner className="animate-spin text-[#faa853] text-3xl" /></div>
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#2d3f5d]">Student Applications</h2>
            <p className="text-sm text-gray-500">Review and manage course applications</p>
          </div>
          <button
            onClick={fetchApplications}
            className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
          >
            <FaSpinner className="text-xs" /> Refresh
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const status = getStatusBadge(app)
              return (
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => handleViewDetails(app)}>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-[#2d3f5d]">{app.course?.course_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaUser className="text-[#faa853] text-xs" />
                          {app.user?.first_name} {app.user?.last_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaEnvelope className="text-[#faa853] text-xs" />
                          {app.user?.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-[#faa853] text-xs" />
                          Applied: {new Date(app.application_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(app)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
                      >
                        <FaEye className="text-xs" /> View
                      </button>
                      {app.status === 'awaiting_approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(app)}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                          >
                            {processingId === app.id ? <FaSpinner className="animate-spin" /> : <FaUserCheck className="text-xs" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                          >
                            <FaTimesCircle className="text-xs" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Details Modal - same as before */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
                    <FaBook className="text-[#faa853] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#2d3f5d]">Application Details</h2>
                    <p className="text-sm text-gray-500">{selectedApp.course?.course_name}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Student Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
                  <FaUser className="text-[#faa853]" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <FaUser className="text-gray-400 text-xs mt-0.5" />
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-[#2d3f5d]">{selectedApp.user?.first_name} {selectedApp.user?.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaEnvelope className="text-gray-400 text-xs mt-0.5" />
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-[#2d3f5d]">{selectedApp.user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
                  <FaBook className="text-[#faa853]" />
                  Course Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Course:</span> <span className="font-medium text-[#2d3f5d]">{selectedApp.course?.course_name}</span></div>
                  <div><span className="text-gray-500">Lesson Type:</span> <span className="font-medium text-[#2d3f5d] capitalize">{selectedApp.lesson_type?.replace('_', ' ')}</span></div>
                  <div><span className="text-gray-500">Payment Plan:</span> <span className="font-medium text-[#2d3f5d]">{selectedApp.payment_plan}</span></div>
                  <div><span className="text-gray-500">Total Fee:</span> <span className="font-medium text-[#faa853]">K{selectedApp.course?.tuition_fee}</span></div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
                  <FaWallet className="text-[#faa853]" />
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-semibold text-green-600">K{calculateTotalPaid().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining Balance</span>
                    <span className={`font-semibold ${calculateRemainingBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      K{calculateRemainingBalance().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <h3 className="font-semibold p-4 bg-gray-50 border-b flex items-center gap-2">
                    <FaHistory className="text-[#faa853]" />
                    Payment History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-600">Date</th>
                          <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                          <th className="px-4 py-2 text-left text-gray-600">Method</th>
                          <th className="px-4 py-2 text-left text-gray-600">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-600">{new Date(p.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-green-600 font-medium">K{p.amount?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-gray-600 capitalize">{p.payment_method}</td>
                            <td className="px-4 py-2 text-gray-500 text-xs">{p.reference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedApp.status === 'awaiting_approval' && (
                  <>
                    <button 
                      onClick={() => handleApprove(selectedApp)} 
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaUserCheck /> Approve Application
                    </button>
                    <button 
                      onClick={() => handleReject(selectedApp)} 
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle /> Reject Application
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="px-6 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}