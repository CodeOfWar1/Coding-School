import { useState, useEffect } from 'react'
import { FaUserGraduate, FaUserFriends, FaTimes } from 'react-icons/fa'
import StudentSignupForm from './StudentSignupForm'
import ParentSignupForm from './ParentSignupForm'

export default function RegisterModal({ open, onClose }) {
  const [userType, setUserType] = useState(null) // 'student' or 'parent'

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
        setUserType(null)
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setUserType(null)
    }
  }, [open])

  if (!open) return null

  const handleClose = () => {
    setUserType(null)
    onClose()
  }

  const handleBack = () => {
    setUserType(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button 
        type="button" 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        aria-label="Close" 
        onClick={handleClose} 
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl animate-scale-in">
        {!userType ? (
          // User Type Selection
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-[#faa853]">Welcome to AnvilTech</p>
                  <h2 className="mt-2 text-3xl font-black">Join Our Community</h2>
                  <p className="mt-2 text-white/80">Choose how you'd like to sign up</p>
                </div>
                <button 
                  onClick={handleClose} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Student Option */}
                <button
                  onClick={() => setUserType('student')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 hover:border-[#faa853] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-[#faa853]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#faa853] transition-colors duration-300">
                    <FaUserGraduate className="text-3xl text-[#faa853] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2d3f5d] mb-2">Student Sign Up</h3>
                  <p className="text-gray-500 text-sm">
                    For learners who want to join our programs
                  </p>
                </button>

                {/* Parent Option */}
                <button
                  onClick={() => setUserType('parent')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 hover:border-[#faa853] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-[#faa853]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#faa853] transition-colors duration-300">
                    <FaUserFriends className="text-3xl text-[#faa853] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2d3f5d] mb-2">Parent Sign Up</h3>
                  <p className="text-gray-500 text-sm">
                    For parents/guardians registering their child
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Sign Up Form
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-[#faa853]">
                    {userType === 'student' ? 'Student' : 'Parent'} Registration
                  </p>
                  <h2 className="text-2xl font-black">
                    {userType === 'student' ? 'Create Student Account' : 'Create Parent Account'}
                  </h2>
                </div>
                <button 
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
                >
                  Back
                </button>
              </div>
            </div>

            {userType === 'student' ? (
              <StudentSignupForm onSuccess={handleClose} />
            ) : (
              <ParentSignupForm onSuccess={handleClose} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}