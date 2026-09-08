import { useState, useEffect } from 'react'
import { FaUserGraduate, FaUserFriends, FaTimes } from 'react-icons/fa'
import ParentRegistration from './ParentRegistration'

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
        

       
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-[#faa853]">
                    Parent Registration
                  </p>
                  <h2 className="text-2xl font-black">
                   Create Parent Account
                  </h2>
                </div>
                
              </div>
            </div>

              <ParentRegistration onSuccess={handleClose} />
            
          </div>
      </div>
    </div>
  )
}