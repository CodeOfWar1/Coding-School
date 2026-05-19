import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

const SYSTEM_STUDENT_EMAIL_DOMAIN = 'student.anvilcodingacademy.local'

export default function StudentSignupForm({ onSuccess }) {
  const pricing = {
    tuition: 'K1300 per month',
    plans: '25% | 50% | 75% | 100%',
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    homeAddress: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required')
      return false
    }
    if (!formData.gender) {
      setError('Gender is required')
      return false
    }
    if (!formData.homeAddress.trim()) {
      setError('Home address is required')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: 'student',
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            home_address: formData.homeAddress,
          }
        }
      })

      if (authError) throw authError

      // Best effort: clear profile email if backend trigger created one.
      if (authData?.user?.id) {
        await supabase.from('profiles').update({ email: null }).eq('id', authData.user.id)
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-4xl text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-[#2d3f5d] mb-2">Registration Successful!</h3>
        <p className="text-gray-600 mb-6">
          Welcome to AnvilCodingAcademy, {formData.firstName}! Your student account has been created.
        </p>
        <button
          onClick={onSuccess}
          className="w-full py-3 rounded-full bg-[#faa853] text-white font-semibold hover:bg-[#e89235] transition-all"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
      <div className="space-y-4">
        {/* First Name & Last Name - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
              placeholder="First name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
              placeholder="Last name"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
            placeholder="your@email.com"
            required
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
            required
          />
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Gender *
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
                className="w-4 h-4 text-[#faa853] focus:ring-[#faa853]/20"
                required
              />
              <span className="text-[#2d3f5d]">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
                className="w-4 h-4 text-[#faa853] focus:ring-[#faa853]/20"
              />
              <span className="text-[#2d3f5d]">Female</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={handleChange}
                className="w-4 h-4 text-[#faa853] focus:ring-[#faa853]/20"
              />
              <span className="text-[#2d3f5d]">Other</span>
            </label>
          </div>
        </div>

        {/* Home Address */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Home Address *
          </label>
          <textarea
            name="homeAddress"
            value={formData.homeAddress}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none resize-none"
            placeholder="Enter your full home address"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none pr-12"
              placeholder="Create a password (min. 6 characters)"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#faa853]"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none pr-12"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#faa853]"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-[#2d3f5d]/5 border border-[#2d3f5d]/10 p-3">
        <p className="text-base font-semibold text-[#2d3f5d]">
          Tuition Fee: <span className="text-[#faa853]">{pricing.tuition}</span>
        </p>
        <p className="text-base text-[#2d3f5d]/90">
          Flexible Payment Options: <span className="font-semibold text-[#faa853]">{pricing.plans}</span>
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-8 py-3 rounded-full bg-[#faa853] text-white font-semibold hover:bg-[#e89235] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Account...
          </div>
        ) : (
          'Sign Up as Student'
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <FaExclamationCircle className="text-red-500 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

    </form>
  )
}