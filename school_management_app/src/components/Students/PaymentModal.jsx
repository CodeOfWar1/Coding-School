import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaArrowRight, FaSpinner } from 'react-icons/fa'

// Load Lenco SDK dynamically
const loadLencoSDK = () => {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="https://pay.lenco.co/js/v1/inline.js"]')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://pay.lenco.co/js/v1/inline.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Lenco SDK'))
    document.body.appendChild(script)
  })
}

export default function PaymentModal({ application, onSubmit, onClose }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [payerDetails, setPayerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  
  const amount = application.course?.tuition_fee || 0
//   const paymentAmount = application.payment_plan === '25%' ? amount * 0.25 :
//                         application.payment_plan === '50%' ? amount * 0.5 :
//                         application.payment_plan === '75%' ? amount * 0.75 : amount

const paymentAmount = 2.50
  
  const LENCO_PUBLIC_KEY = "pub-7badf530b79794712d535affe1d278f866d1844a2cbcc78a"
  
  // Preload Lenco SDK when modal opens
  useEffect(() => {
    const preloadSDK = async () => {
      try {
        await loadLencoSDK()
        setSdkLoaded(true)
      } catch (error) {
        console.error('Failed to load payment SDK:', error)
      }
    }
    preloadSDK()
  }, [])
  
  const handlePayerDetailsChange = (e) => {
    const { name, value } = e.target
    setPayerDetails(prev => ({ ...prev, [name]: value }))
  }
  
  const savePaymentRecord = async (paymentData) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          application_id: application.id,
          user_id: application.user_id,
          course_id: application.course_id,
          amount: paymentAmount,
          payment_plan: application.payment_plan,
          payment_method: 'lenco',
          status: 'completed',
          reference: paymentData.reference,
          transaction_id: paymentData.transactionId,
          payer_first_name: payerDetails.firstName,
          payer_last_name: payerDetails.lastName,
          payer_email: payerDetails.email,
          payer_phone: payerDetails.phone,
          transaction_date: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      console.log('Payment record saved:', data)
      return data
    } catch (error) {
      console.error('Error saving payment record:', error)
      throw error
    }
  }
  
  const processPayment = async (e) => {
    e.preventDefault()
    
    // Validate payer details
    if (!payerDetails.firstName || !payerDetails.email || !payerDetails.phone) {
      alert('Please fill in all required fields')
      return
    }
    if (!payerDetails.email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }
    if (payerDetails.phone.length < 9) {
      alert('Please enter a valid phone number')
      return
    }
    
    if (!sdkLoaded) {
      alert('Payment system is still loading. Please wait...')
      return
    }
    
    setIsSubmitting(true)
    setStep(2)
    
    try {
      const reference = `app-${application.id}-${Date.now()}`
      
      // Wait for LencoPay to be available
      await new Promise(resolve => {
        const checkLenco = setInterval(() => {
          if (window.LencoPay) {
            clearInterval(checkLenco)
            resolve()
          }
        }, 100)
      })
      
      window.LencoPay.getPaid({
        key: LENCO_PUBLIC_KEY,
        reference: reference,
        email: payerDetails.email,
        amount: paymentAmount,
        currency: "ZMW",
        channels: ["card", "mobile-money"],
        customer: {
          firstName: payerDetails.firstName,
          lastName: payerDetails.lastName || '',
          phone: payerDetails.phone
        },
        onSuccess: async function (res) {
          try {
            setPaymentStatus('success')
            // Save payment record to database
            await savePaymentRecord({
              reference: res.reference,
              transactionId: res.transactionId || res.reference
            })
            
            // Call parent onSubmit to mark application as completed
            await onSubmit()
            
            // Show success and close after delay
            setTimeout(() => {
              onClose()
            }, 1500)
          } catch (error) {
            console.error('Error saving payment:', error)
            setPaymentStatus('error')
            alert('Payment was successful but failed to save. Please contact support with your transaction reference: ' + reference)
            setTimeout(() => {
              onClose()
            }, 3000)
          }
        },
        onClose: function () {
          if (paymentStatus !== 'success') {
            setIsSubmitting(false)
            setStep(1)
            setPaymentStatus(null)
          }
        },
        onError: function (error) {
          console.error('Payment error:', error)
          setPaymentStatus('error')
          setIsSubmitting(false)
          setStep(1)
          alert('Payment failed. Please try again.')
          setTimeout(() => {
            setPaymentStatus(null)
          }, 3000)
        }
      })
    } catch (error) {
      console.error('Error initializing payment:', error)
      setIsSubmitting(false)
      setStep(1)
      alert('Unable to initialize payment. Please check your internet connection and try again.')
    }
  }
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#2d3f5d]">
                {step === 1 && 'Complete Payment'}
                {step === 2 && paymentStatus === 'success' && 'Payment Successful!'}
                {step === 2 && !paymentStatus && 'Processing Payment'}
                {step === 2 && paymentStatus === 'error' && 'Payment Failed'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{application.course?.course_name}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <FaTimes />
            </button>
          </div>
        </div>
        
        {step === 1 && (
          <form onSubmit={processPayment} className="p-5 space-y-5">
            <div className="bg-[#faa853]/5 border border-[#faa853]/20 rounded-lg p-4">
              <p className="text-sm text-[#2d3f5d] mb-1">Payment Plan: <span className="font-semibold">{application.payment_plan}</span></p>
              <p className="text-2xl font-bold text-[#faa853]">K{paymentAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Total course fee: K{amount}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#2d3f5d] mb-2">First Name *</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="firstName"
                  value={payerDetails.firstName}
                  onChange={handlePayerDetailsChange}
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Last Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="lastName"
                  value={payerDetails.lastName}
                  onChange={handlePayerDetailsChange}
                  placeholder="Doe"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Email *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={payerDetails.email}
                  onChange={handlePayerDetailsChange}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#2d3f5d] mb-2">Phone Number *</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="tel"
                  name="phone"
                  value={payerDetails.phone}
                  onChange={handlePayerDetailsChange}
                  placeholder="097xxxxxxx"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !sdkLoaded}
              className="w-full py-2.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheck className="text-sm" />
                  Pay K{paymentAmount.toFixed(2)}
                </>
              )}
            </button>
            
            {!sdkLoaded && (
              <p className="text-xs text-center text-gray-500">
                Loading payment gateway...
              </p>
            )}
          </form>
        )}
        
        {step === 2 && (
          <div className="p-8 text-center">
            {paymentStatus === 'success' ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-3xl text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Successful!</h3>
                <p className="text-gray-500 text-sm">Your payment has been processed successfully.</p>
                <p className="text-gray-500 text-sm mt-2">Redirecting...</p>
              </>
            ) : paymentStatus === 'error' ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTimes className="text-3xl text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-gray-500 text-sm">Please try again or contact support.</p>
                <button
                  onClick={() => {
                    setPaymentStatus(null)
                    setIsSubmitting(false)
                    setStep(1)
                  }}
                  className="mt-4 px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors"
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 border-4 border-[#faa853] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-[#2d3f5d] mb-2">Processing Payment</h3>
                <p className="text-gray-500 text-sm">Please wait while we redirect you to the payment gateway...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}