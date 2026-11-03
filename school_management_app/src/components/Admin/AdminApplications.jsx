import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaMoneyBillWave,
  FaUserCheck,
  FaHourglassHalf,
  FaCalendarAlt,
  FaBook,
  FaUser,
  FaEnvelope,
  FaClock
} from 'react-icons/fa'
import ApplicationDetailsModal from './ApplicationDetailModal'

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
          child:child_id (*),
          parent:parent_id (*)
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

  const handleViewDetails = async (app) => {
    setSelectedApp(app)
    await fetchPayments(app.id)
    setShowDetailsModal(true)
  }

  const handleApprove = async (app) => {
    if (!window.confirm(`Approve application for ${app.course?.course_name}? This will create a student record and enrollment.`)) return

    setProcessingId(app.id)
    try {
      let { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', app.child_id)
        .maybeSingle()

      let studentId = existingStudent?.id

      if (!existingStudent) {
        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert({
            student_id: app.child_id,
            admitted_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single()

        if (studentError) throw studentError
        studentId = newStudent.id
      }

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          course_id: app.course_id,
          enrolled_date: new Date().toISOString().split('T')[0],
          status: 'active'
        })

      if (enrollmentError) throw enrollmentError

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
                          {app.child?.first_name} {app.child?.last_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaEnvelope className="text-[#faa853] text-xs" />
                          {app.child?.email}
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

      {showDetailsModal && selectedApp && (
        <ApplicationDetailsModal
          app={selectedApp}
          payments={payments}
          processingId={processingId}
          onClose={() => setShowDetailsModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  )
}