import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa'
import logoImage from '../assets/logo.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (!user || !profile) return

    if (!user.email_confirmed_at) return

    if (profile.role === 'student') {
      navigate('/dashboard/student', { replace: true })
    } else if (profile.role === 'parent') {
      navigate('/dashboard/parent', { replace: true })
    } else if (profile.role === 'finance') {
      navigate('/dashboard/finance', { replace: true })
    } else if (profile.role === 'admin') {
      navigate('/dashboard/admin', { replace: true })
    }
  }, [user, profile])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Email not verified
    if (data.user && !data.user.email_confirmed_at) {
      setError('Please verify your email before logging in. Check your inbox!')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Success - let AuthContext handle the redirect
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#faa853]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#2d3f5d]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="Logo" className="h-20 w-auto" />
          </div>
          <p className="mt-2 text-gray-500">Welcome back! Please sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3f5d] mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-gray-500 hover:text-[#faa853]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#faa853] text-white rounded-xl font-semibold hover:bg-[#e89235] transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </button>

            <div className="text-center">
              <Link to="/" className="text-[#faa853] font-semibold hover:text-[#e89235]">
                Register Now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}