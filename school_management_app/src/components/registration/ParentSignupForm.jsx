import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

export default function ParentSignupForm({ onSuccess }) {
  const pricing = {
    tuition: 'K1300 per month',
    plans: '25% | 50% | 75% | 100%',
  }

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    childName: '',
    childAge: '',
    childGrade: '',
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
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
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
    if (!formData.childName.trim()) {
      setError("Child's name is required")
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
            full_name: formData.fullName,
            user_type: 'parent',
            phone: formData.phone,
            child_name: formData.childName,
            child_age: formData.childAge,
            child_grade: formData.childGrade,
          }
        }
      })

      if (authError) throw authError

      // Insert into users table
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            user_type: 'parent',
            phone: formData.phone,
            child_name: formData.childName,
            child_age: formData.childAge,
            child_grade: formData.childGrade,
            created_at: new Date(),
          }
        ])

      if (dbError) throw dbError

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
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
          Welcome to AnvilCodingAcademy! Please check your email to verify your account.
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
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <FaExclamationCircle className="text-red-500 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#2d3f5d] border-b border-gray-200 pb-2">Parent Information</h3>
        
        {/* Parent Full Name */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
            placeholder="you@example.com"
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
              placeholder="Create a password"
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

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
            placeholder="+1234567890"
          />
        </div>

        <h3 className="text-lg font-bold text-[#2d3f5d] border-b border-gray-200 pb-2 mt-4">Child Information</h3>

        {/* Child Name */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Child's Full Name *
          </label>
          <input
            type="text"
            name="childName"
            value={formData.childName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
            placeholder="Enter child's name"
            required
          />
        </div>

        {/* Child Age */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Child's Age (5-19)
          </label>
          <input
            type="number"
            name="childAge"
            value={formData.childAge}
            onChange={handleChange}
            min="5"
            max="19"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
            placeholder="Child's age"
          />
        </div>

        {/* Child Grade */}
        <div>
          <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
            Child's Grade
          </label>
          <select
            name="childGrade"
            value={formData.childGrade}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/20 transition-all outline-none"
          >
            <option value="">Select Grade</option>
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
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
          'Sign Up as Parent'
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}