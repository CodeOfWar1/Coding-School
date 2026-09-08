import { useState } from 'react'
import { useAuth } from '../../state/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaSpinner, 
  FaTimes, 
  FaChild, 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaUserTag, 
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'

export default function AddChildModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    homeAddress: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName.trim()) {
      return setError('First name is required')
    }

    if (!formData.lastName.trim()) {
      return setError('Last name is required')
    }

    if (!formData.email.trim()) {
      return setError('Email is required')
    }

    if (!formData.password) {
      return setError('Password is required')
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters long')
    }

    if (!formData.dateOfBirth) {
      return setError('Date of birth is required')
    }

    if (!formData.gender) {
      return setError('Gender is required')
    }

    if (!formData.homeAddress.trim()) {
      return setError('Home address is required')
    }

    if (!user?.id) {
      return setError('You must be logged in')
    }

    setLoading(true)
    setError('')

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`

      // Create child Auth account
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,

          options: {
            emailRedirectTo:
              `${window.location.origin}/dashboard/student/profile`,

            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              full_name: fullName,
              role: 'student',
              parent_id: user.id,
              date_of_birth: formData.dateOfBirth,
              gender: formData.gender,
              home_address: formData.homeAddress,
            }
          }
        })

      if (authError) {
        throw authError
      }

      console.log('Child account created:', authData)

      // Give the auth trigger a moment to complete
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          dateOfBirth: '',
          gender: '',
          homeAddress: '',
        })

        setShowPassword(false)
        setSuccess(false)

        if (onSuccess) {
          onSuccess()
        }

        onClose()
      }, 5000)

    } catch (err) {
      console.error('Error creating child account:', err)
      setError(
        err.message ||
        'Failed to create child account. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
              <FaChild className="text-[#faa853] text-lg" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#2d3f5d]">
                Add a Child
              </h2>

              <p className="text-sm text-[#2d3f5d]/60">
                Create a new student account for your child
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <FaTimes />
          </button>

        </div>

        {success ? (

          /* Success State */
          <div className="p-10 text-center">

            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>

            <h3 className="text-2xl font-bold text-[#2d3f5d] mb-3">
              Child Account Created!
            </h3>

            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              A verification email has been sent to{' '}
              <strong className="text-[#faa853]">
                {formData.email}
              </strong>.
            </p>

            <p className="text-sm text-gray-500 mt-5">
              Your child will be login in using the email address and
              password you entered.
            </p>

          </div>

        ) : (

          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">

                <FaInfoCircle className="text-red-500 mt-0.5 flex-shrink-0" />

                <span>{error}</span>

              </div>
            )}

            {/* Personal Information */}
            <div>

              <h3 className="text-sm font-semibold text-[#2d3f5d] uppercase tracking-wider mb-4 flex items-center gap-2">

                <FaUser className="text-[#faa853]" />

                Personal Information

              </h3>

              <div className="grid grid-cols-2 gap-4">

                {/* First Name */}
                <div>

                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-all"
                    placeholder="John"
                    required
                  />

                </div>

                {/* Last Name */}
                <div>

                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-all"
                    placeholder="Doe"
                    required
                  />

                </div>

              </div>

              {/* Email */}
              <div className="mt-4">

                <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">

                  <FaEnvelope className="inline mr-2 text-[#faa853]" />

                  Email Address <span className="text-red-500">*</span>

                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-all"
                  placeholder="child@example.com"
                  required
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Confirmation email will be sent to this address
                </p>

              </div>

              {/* Password */}
              <div className="mt-4">

                <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-all"
                    placeholder="Enter password for your child"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>

                <p className="text-xs text-gray-500 mt-1.5">
                  The password must be at least 8 characters long.
                  You will need to give this password to your child.
                </p>

              </div>

              {/* Date + Gender */}
              <div className="grid grid-cols-2 gap-4 mt-4">

                <div>

                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">

                    <FaCalendarAlt className="inline mr-2 text-[#faa853]" />

                    Date of Birth <span className="text-red-500">*</span>

                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-all"
                    required
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">

                    <FaUserTag className="inline mr-2 text-[#faa853]" />

                    Gender <span className="text-red-500">*</span>

                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-all bg-white"
                    required
                  >

                    <option value="">
                      Select gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>

                    <option value="prefer-not-to-say">
                      Prefer not to say
                    </option>

                  </select>

                </div>

              </div>

              {/* Address */}
              <div className="mt-4">

                <label className="block text-sm font-medium text-[#2d3f5d] mb-1.5">

                  <FaMapMarkerAlt className="inline mr-2 text-[#faa853]" />

                  Home Address <span className="text-red-500">*</span>

                </label>

                <textarea
                  name="homeAddress"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="123 Main St, City, State, ZIP"
                  required
                />

              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-[#2d3f5d] hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#faa853] text-white rounded-xl hover:bg-[#e8993f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
              >

                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FaChild />
                    Create Child Account
                  </>
                )}

              </button>

            </div>

          </form>
        )}

      </div>
    </div>
  )
}