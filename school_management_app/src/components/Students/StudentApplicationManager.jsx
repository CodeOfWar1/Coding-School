import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FaPlus, 
  FaTrash, 
  FaEdit,
  FaArrowRight, 
  FaCalendarAlt, 
  FaBook, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaTimes,
  FaSpinner,
  FaEye,
  FaHistory,
  FaWallet,
  FaHourglassHalf,
  FaUserCheck
} from 'react-icons/fa'
import PaymentModal from './PaymentModal'

export default function StudentApplicationManager({ 
  applications, 
  courses, 
  isStudent, 
  onCreateNew, 
  onDelete,
  onUpdateProgress,
  onSuccess,
  showToast 
}) {
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [payments, setPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [lessonType, setLessonType] = useState('')
  const [paymentPlan, setPaymentPlan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentModalState, setPaymentModalState] = useState({ show: false, application: null })

  const fetchPayments = async (applicationId) => {
    setLoadingPayments(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    } finally {
      setLoadingPayments(false)
    }
  }

  const handleViewDetails = async (app) => {
    setSelectedApp(app)
    await fetchPayments(app.id)
    setShowDetailsModal(true)
  }

  const calculateTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  }

  const calculateRemainingBalance = () => {
    const totalFee = selectedApp?.course?.tuition_fee || 0
    const totalPaid = calculateTotalPaid()
    return totalFee - totalPaid
  }

  // Get the correct status message based on progress and admin status
  const getApplicationStatusMessage = () => {
    const totalFee = selectedApp?.course?.tuition_fee || 0
    const totalPaid = calculateTotalPaid()
    const hasFullPayment = totalPaid >= totalFee
    
    // Check admin status first
    if (selectedApp?.status === 'rejected') {
      return { 
        type: 'rejected',
        message: 'Your application has been rejected. Please contact support for more information.',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <FaExclamationTriangle className="text-red-600" />
      }
    }
    
    if (selectedApp?.status === 'approved') {
      return { 
        type: 'approved',
        message: '✅ Your application has been approved! You are now officially enrolled. Welcome to the class!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <FaCheckCircle className="text-green-600" />
      }
    }
    
    if (selectedApp?.status === 'awaiting_approval') {
      return { 
        type: 'awaiting_approval',
        message: '⏳ Your payment has been confirmed! Your application is now awaiting admin approval. You will be admitted to the class within 3 business working days.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <FaHourglassHalf className="text-yellow-600" />
      }
    }
    
    // Check progress for payment flow
    if (selectedApp?.progress === 'parent_details' || selectedApp?.progress === 'payment') {
      if (hasFullPayment) {
        return { 
          type: 'payment_complete',
          message: `✅ Full payment received (K${totalPaid.toFixed(2)}). Your application is being processed for admin approval.`,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <FaCheckCircle className="text-green-600" />
        }
      } else if (totalPaid > 0) {
        return { 
          type: 'partial_payment',
          message: `⚠️ Partial payment of K${totalPaid.toFixed(2)} received. Remaining balance: K${calculateRemainingBalance().toFixed(2)}. Please complete your payment.`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <FaMoneyBillWave className="text-orange-600" />
        }
      } else {
        return { 
          type: 'payment_required',
          message: 'Payment required to complete your application. Click "Make Payment" below.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <FaMoneyBillWave className="text-red-600" />
        }
      }
    }
    
    if (selectedApp?.progress === 'completed') {
      return { 
        type: 'completed',
        message: 'Your application has been submitted. Awaiting admin review.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <FaClock className="text-blue-600" />
      }
    }
    
    return { 
      type: 'unknown',
      message: 'Application status unknown. Please contact support.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: <FaExclamationTriangle className="text-gray-600" />
    }
  }

  const handleContinue = async (app) => {
    // If progress is parent_details or payment, open payment modal
    if (app.progress === 'parent_details' || app.progress === 'payment') {
      setPaymentModalState({ show: true, application: app })
    }
  }
  
  const handlePaymentSubmit = async () => {
    // After payment, update progress to 'completed' so admin can review
    await onUpdateProgress(paymentModalState.application.id, 'completed')
    setPaymentModalState({ show: false, application: null })
    onSuccess()
    showToast('Payment successful! Your application is now awaiting admin approval.', 'success')
  }
  
  const handleClosePaymentModal = () => {
    setPaymentModalState({ show: false, application: null })
  }
  
  const handleEdit = (app) => {
    setEditingApplication(app)
    setSelectedCourse(app.course_id)
    setLessonType(app.lesson_type)
    setPaymentPlan(app.payment_plan)
    setShowEditModal(true)
  }
  
  const handleUpdateApplication = async (e) => {
    e.preventDefault()
    if (!selectedCourse || !lessonType || !paymentPlan) {
      showToast('Please fill all fields', 'error')
      return
    }
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('application')
        .update({
          course_id: selectedCourse,
          lesson_type: lessonType,
          payment_plan: paymentPlan
        })
        .eq('id', editingApplication.id)
      
      if (error) throw error
      
      setShowEditModal(false)
      setEditingApplication(null)
      setSelectedCourse('')
      setLessonType('')
      setPaymentPlan('')
      onSuccess()
      showToast('Application updated successfully!', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleCreateApplication = async (e) => {
    e.preventDefault()
    if (!selectedCourse || !lessonType || !paymentPlan) {
      showToast('Please fill all fields', 'error')
      return
    }
    
    setIsSubmitting(true)
    try {
      const newApp = await onCreateNew(selectedCourse, lessonType, paymentPlan)
      setShowNewModal(false)
      setSelectedCourse('')
      setLessonType('')
      setPaymentPlan('')
      onSuccess()
      
      if (newApp) {
        setPaymentModalState({ show: true, application: newApp })
      }
      showToast('Application created! Please complete payment.', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteApp = async (id, courseName) => {
    if (window.confirm(`Delete application for ${courseName}?`)) {
      try {
        await onDelete(id)
        onSuccess()
        showToast('Application deleted')
      } catch (error) {
        showToast(error.message, 'error')
      }
    }
  }
  
  const getProgressColor = (progress) => {
    const colors = {
      parent_details: 'bg-[#faa853]/10 text-[#faa853]',
      payment: 'bg-amber-100 text-amber-700',
      completed: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700'
    }
    return colors[progress] || 'bg-gray-100 text-gray-700'
  }
  
  const getProgressLabel = (progress) => {
    const labels = {
      parent_details: 'Payment Required',
      payment: 'Payment Required',
      completed: 'completed',
      rejected: 'Rejected'
    }
    return labels[progress] || progress
  }
  
  const getProgressIcon = (progress) => {
    const icons = {
      parent_details: <FaMoneyBillWave className="text-xs" />,
      payment: <FaMoneyBillWave className="text-xs" />,
      completed: <FaClock className="text-xs" />,
      rejected: <FaExclamationTriangle className="text-xs" />
    }
    return icons[progress] || null
  }
  
  const handleCloseNewModal = () => {
    setShowNewModal(false)
    setSelectedCourse('')
    setLessonType('')
    setPaymentPlan('')
  }
  
  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingApplication(null)
    setSelectedCourse('')
    setLessonType('')
    setPaymentPlan('')
  }
  
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#2d3f5d]">Course Applications</h2>
            <p className="text-gray-500 mt-1">Apply for courses or continue existing applications</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors flex items-center gap-2"
          >
            <FaPlus className="text-sm" />
            New Application
          </button>
        </div>
        
        {/* Applications List */}
        {applications.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <FaBook className="text-5xl text-[#faa853]/50 mx-auto mb-3" />
            <p className="text-gray-500">No applications yet. Start your journey by creating one!</p>
          </div>
        )}
        
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#faa853]/30 transition-all">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 cursor-pointer" onClick={() => handleViewDetails(app)}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-[#2d3f5d] text-lg">{app.course?.course_name || 'Unknown Course'}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(app.progress)}`}>
                      {getProgressIcon(app.progress)}
                      {getProgressLabel(app.progress)}
                    </span>
                    {app.status === 'awaiting_approval' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <FaHourglassHalf className="text-xs" />
                        Awaiting Approval
                      </span>
                    )}
                    {app.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <FaCheckCircle className="text-xs" />
                        Approved
                      </span>
                    )}
                    {app.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <FaExclamationTriangle className="text-xs" />
                        Rejected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-[#faa853] text-xs" />
                      <span>Applied: {new Date(app.application_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBook className="text-[#faa853] text-xs" />
                      <span>Lesson: {app.lesson_type?.replace('_', ' ') || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave className="text-[#faa853] text-xs" />
                      <span>Plan: {app.payment_plan || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Fee:</span>
                      <span>K{app.course?.tuition_fee || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(app)}
                    className="px-3 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors"
                  >
                    <FaEye className="text-xs" />
                    Details
                  </button>
                  {(app.progress === 'parent_details' || app.progress === 'payment') && app.status !== 'approved' && app.status !== 'rejected' && (
                    <>
                      <button
                        onClick={() => handleEdit(app)}
                        className="px-3 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors"
                      >
                        <FaEdit className="text-xs" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleContinue(app)}
                        className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] text-sm flex items-center gap-2 transition-colors"
                      >
                        Continue
                        <FaArrowRight className="text-xs" />
                      </button>
                    </>
                  )}
                  {(app.progress === 'parent_details' || app.progress === 'payment') && (
                    <button
                      onClick={() => handleDeleteApp(app.id, app.course?.course_name)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm flex items-center gap-2 transition-colors"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#2d3f5d]">Application Details</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedApp.course?.course_name}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-6">
              {/* Application Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-[#2d3f5d] mb-3 flex items-center gap-2">
                  <FaBook className="text-[#faa853]" />
                  Application Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Course</p>
                    <p className="font-medium text-[#2d3f5d]">{selectedApp.course?.course_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lesson Type</p>
                    <p className="font-medium text-[#2d3f5d] capitalize">{selectedApp.lesson_type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Plan</p>
                    <p className="font-medium text-[#2d3f5d]">{selectedApp.payment_plan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Fee</p>
                    <p className="font-medium text-[#faa853]">K{selectedApp.course?.tuition_fee?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Application Date</p>
                    <p className="font-medium text-[#2d3f5d]">{new Date(selectedApp.application_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Application Progress</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(selectedApp.progress)}`}>
                      {getProgressIcon(selectedApp.progress)}
                      {getProgressLabel(selectedApp.progress)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Admin Status</p>
                    <div>
                      {selectedApp.status === 'awaiting_approval' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <FaHourglassHalf className="text-xs" />
                          Awaiting Approval
                        </span>
                      )}
                      {selectedApp.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <FaCheckCircle className="text-xs" />
                          Approved
                        </span>
                      )}
                      {selectedApp.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <FaExclamationTriangle className="text-xs" />
                          Rejected
                        </span>
                      )}
                      {!selectedApp.status && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <FaClock className="text-xs" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-[#faa853]/10 to-[#2d3f5d]/10 rounded-lg p-4">
                <h3 className="font-semibold text-[#2d3f5d] mb-3 flex items-center gap-2">
                  <FaWallet className="text-[#faa853]" />
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Fee:</span>
                    <span className="font-semibold text-[#2d3f5d]">K{selectedApp.course?.tuition_fee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-semibold text-green-600">K{calculateTotalPaid().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Remaining Balance:</span>
                    <span className={`font-bold ${calculateRemainingBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      K{calculateRemainingBalance().toFixed(2)}
                    </span>
                  </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {calculateRemainingBalance() > 0 && selectedApp.status === 'approved' && selectedApp.status !== 'rejected' && (
                        <button
                            onClick={() => {
                            setShowDetailsModal(false)
                            setPaymentModalState({ show: true, application: selectedApp })
                            }}
                            className="flex-1 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors flex items-center justify-center gap-2"
                        >
                            <FaMoneyBillWave className="text-sm" />
                            Make Payment (K{calculateRemainingBalance().toFixed(2)})
                        </button>
                        )}
                    </div>


                </div>
              </div>
              
              {/* Payment History */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <h3 className="font-semibold text-[#2d3f5d] p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <FaHistory className="text-[#faa853]" />
                  Payment History
                </h3>
                {loadingPayments ? (
                  <div className="p-8 text-center">
                    <FaSpinner className="animate-spin text-[#faa853] mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading payments...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No payments made yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-600">Date</th>
                          <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                          <th className="px-4 py-2 text-left text-gray-600">Method</th>
                          <th className="px-4 py-2 text-left text-gray-600">Reference</th>
                          <th className="px-4 py-2 text-left text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-600">{new Date(payment.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-2 font-medium text-green-600">K{payment.amount?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-gray-600 capitalize">{payment.payment_method}</td>
                            <td className="px-4 py-2 text-gray-600 text-xs">{payment.reference}</td>
                            <td className="px-4 py-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                <FaCheckCircle className="text-xs" />
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Status Message based on both progress and admin status */}
              <div className={`${getApplicationStatusMessage().bgColor} border ${getApplicationStatusMessage().borderColor} rounded-lg p-4 flex items-start gap-3`}>
                {getApplicationStatusMessage().icon}
                <div>
                  <p className={`font-medium ${getApplicationStatusMessage().color}`}>
                    {getApplicationStatusMessage().type === 'awaiting_approval' && 'Awaiting Admin Approval'}
                    {getApplicationStatusMessage().type === 'approved' && 'Application Approved!'}
                    {getApplicationStatusMessage().type === 'rejected' && 'Application Rejected'}
                    {getApplicationStatusMessage().type === 'payment_required' && 'Payment Required'}
                    {getApplicationStatusMessage().type === 'partial_payment' && 'Partial Payment Received'}
                    {getApplicationStatusMessage().type === 'payment_complete' && 'Payment Complete'}
                    {getApplicationStatusMessage().type === 'completed' && 'Application Submitted'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{getApplicationStatusMessage().message}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {calculateRemainingBalance() > 0 && (selectedApp.progress === 'parent_details' || selectedApp.progress === 'payment') && selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleContinue(selectedApp)
                    }}
                    className="flex-1 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors flex items-center justify-center gap-2"
                  >
                    <FaMoneyBillWave className="text-sm" />
                    Make Payment (K{calculateRemainingBalance().toFixed(2)})
                  </button>
                )}
                {calculateRemainingBalance() === 0 && selectedApp.progress === 'completed' && selectedApp.status === 'awaiting_approval' && (
                  <div className="flex-1 py-2 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center gap-2">
                    <FaHourglassHalf className="text-sm" />
                    Payment Completed - Awaiting Admin Approval
                  </div>
                )}
                {selectedApp.status === 'approved' && (
                  <div className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2">
                    <FaUserCheck className="text-sm" />
                    Application Approved! Welcome to the class!
                  </div>
                )}
                {selectedApp.status === 'rejected' && (
                  <div className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg flex items-center justify-center gap-2">
                    <FaExclamationTriangle className="text-sm" />
                    Application Rejected - Contact Support
                  </div>
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
      
      {/* New Application Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#2d3f5d]">Start New Application</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details to apply for a course</p>
                </div>
                <button
                  onClick={handleCloseNewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateApplication} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Select Course *</label>
                {!courses || courses.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center gap-2">
                    <FaSpinner className="animate-spin text-[#faa853]" />
                    Loading courses...
                  </div>
                ) : (
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} - K{course.tuition_fee}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Lesson Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['online_saturday', 'online_sunday', 'offline_saturday', 'offline_sunday'].map(type => (
                    <label key={type} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      lessonType === type
                        ? 'border-[#faa853] bg-[#faa853]/5'
                        : 'border-gray-200 hover:border-[#faa853]/50 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="lessonType"
                        value={type}
                        checked={lessonType === type}
                        onChange={(e) => setLessonType(e.target.value)}
                        className="text-[#faa853] focus:ring-[#faa853]"
                      />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Payment Plan *</label>
                <div className="grid grid-cols-4 gap-3">
                  {['25%', '50%', '75%', '100%'].map(plan => (
                    <label key={plan} className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentPlan === plan
                        ? 'border-[#faa853] bg-[#faa853]/5'
                        : 'border-gray-200 hover:border-[#faa853]/50 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value={plan}
                        checked={paymentPlan === plan}
                        onChange={(e) => setPaymentPlan(e.target.value)}
                        className="text-[#faa853] focus:ring-[#faa853]"
                      />
                      <span className="text-sm font-medium">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !courses || courses.length === 0}
                  className="flex-1 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-sm" />
                      Create Application
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseNewModal}
                  className="px-5 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Application Modal */}
      {showEditModal && editingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#2d3f5d]">Edit Application</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your application details</p>
                </div>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateApplication} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Select Course *</label>
                {!courses || courses.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center gap-2">
                    <FaSpinner className="animate-spin text-[#faa853]" />
                    Loading courses...
                  </div>
                ) : (
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} - K{course.tuition_fee}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Lesson Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['online_saturday', 'online_sunday', 'offline_saturday', 'offline_sunday'].map(type => (
                    <label key={type} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      lessonType === type
                        ? 'border-[#faa853] bg-[#faa853]/5'
                        : 'border-gray-200 hover:border-[#faa853]/50 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="lessonType"
                        value={type}
                        checked={lessonType === type}
                        onChange={(e) => setLessonType(e.target.value)}
                        className="text-[#faa853] focus:ring-[#faa853]"
                      />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Payment Plan *</label>
                <div className="grid grid-cols-4 gap-3">
                  {['25%', '50%', '75%', '100%'].map(plan => (
                    <label key={plan} className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentPlan === plan
                        ? 'border-[#faa853] bg-[#faa853]/5'
                        : 'border-gray-200 hover:border-[#faa853]/50 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value={plan}
                        checked={paymentPlan === plan}
                        onChange={(e) => setPaymentPlan(e.target.value)}
                        className="text-[#faa853] focus:ring-[#faa853]"
                      />
                      <span className="text-sm font-medium">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !courses || courses.length === 0}
                  className="flex-1 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaEdit className="text-sm" />
                      Update Application
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-5 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {paymentModalState.show && paymentModalState.application && (
        <PaymentModal
          application={paymentModalState.application}
          onSubmit={handlePaymentSubmit}
          onClose={handleClosePaymentModal}
        />
      )}
    </>
  )
}