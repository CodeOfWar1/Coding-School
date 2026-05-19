import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FaSpinner, 
  FaEnvelope, 
  FaCheckCircle, 
  FaTimes, 
  FaUserPlus, 
  FaTrash, 
  FaKey,
  FaUser,
  FaUserGraduate,
  FaCalendarAlt,
  FaCopy,
  FaInfoCircle
} from 'react-icons/fa'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  })
  const [sendingInvite, setSendingInvite] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newTeacherCredentials, setNewTeacherCredentials] = useState({ email: '', password: '' })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })
      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password + '@Anvil2026'
  }

  const handleCreateTeacher = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert('Please fill in all fields')
      return
    }

    setSendingInvite(true)
    try {
      const tempPassword = generateTemporaryPassword()
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: 'teacher'
          }
        }
      })

      if (authError) throw authError

      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'teacher' })
          .eq('id', authData.user.id)

        if (profileError) console.error('Error updating profile role:', profileError)
      }

      setNewTeacherCredentials({
        email: formData.email,
        password: tempPassword
      })
      setShowPasswordModal(true)
      
      setFormData({ email: '', firstName: '', lastName: '' })
      setShowInviteModal(false)
      await fetchTeachers()
      
    } catch (error) {
      console.error('Error creating teacher:', error)
      alert(error.message || 'Error creating teacher account')
    } finally {
      setSendingInvite(false)
    }
  }

  const handleResetPassword = async (teacher) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(teacher.email, {
        redirectTo: `${window.location.origin}/update-password`
      })
      
      if (error) throw error
      
      alert(`Password reset email sent to ${teacher.email}`)
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Error sending password reset email')
    }
  }

  const handleDeleteTeacher = async (teacher) => {
    if (!window.confirm(`Remove teacher ${teacher.first_name} ${teacher.last_name}?`)) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'inactive' })
        .eq('id', teacher.id)
      
      if (error) throw error
      
      await fetchTeachers()
      alert('Teacher removed from active teachers list')
    } catch (error) {
      console.error('Error removing teacher:', error)
      alert('Error removing teacher')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Invite Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#2d3f5d] flex items-center gap-2">
                <FaUserPlus className="text-[#faa853]" />
                Invite New Teacher
              </h2>
              <p className="text-sm text-gray-500 mt-1">Create a teacher account and share login credentials</p>
            </div>
            <button 
              onClick={() => setShowInviteModal(true)} 
              className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors text-sm flex items-center gap-2"
            >
              <FaUserPlus className="text-xs" /> Invite Teacher
            </button>
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaUserGraduate className="text-[#faa853]" />
              <h3 className="font-semibold text-[#2d3f5d]">Current Teachers</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {teachers.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Manage existing teacher accounts</p>
          </div>
          
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <FaUserGraduate className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No teachers added yet</p>
              <button 
                onClick={() => setShowInviteModal(true)} 
                className="mt-3 text-[#faa853] text-sm hover:underline flex items-center gap-1 mx-auto"
              >
                <FaUserPlus className="text-xs" /> Invite your first teacher
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {teachers.map(teacher => (
                <div key={teacher.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#faa853]/10 flex items-center justify-center">
                          <FaUser className="text-[#faa853] text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-[#2d3f5d]">
                            {teacher.first_name} {teacher.last_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <FaEnvelope className="text-xs" /> {teacher.email}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FaCalendarAlt className="text-xs" /> 
                              Joined: {new Date(teacher.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetPassword(teacher)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
                        title="Send password reset email"
                      >
                        <FaKey className="text-xs" /> Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher)}
                        className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center gap-1"
                      >
                        <FaTrash className="text-xs" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaUserPlus className="text-[#faa853] text-lg" />
                <h2 className="text-lg font-semibold text-[#2d3f5d]">Invite New Teacher</h2>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateTeacher} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-1">First Name *</label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Last Name *</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="teacher@anvilcodingacademy.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <FaInfoCircle className="text-xs" />
                  The teacher will need to confirm their email address
                </p>
              </div>
              <button
                type="submit"
                disabled={sendingInvite}
                className="w-full py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {sendingInvite ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
                {sendingInvite ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Display Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-600 text-lg" />
                <h2 className="text-lg font-semibold text-[#2d3f5d]">Teacher Account Created!</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-3 flex items-center gap-1">
                  <FaKey className="text-xs" /> Login Credentials
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <code className="block bg-white px-3 py-2 rounded border border-gray-200 font-mono text-sm break-all">
                      {newTeacherCredentials.email}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Temporary Password</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 font-mono text-sm">
                        {newTeacherCredentials.password}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newTeacherCredentials.password)}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                        title="Copy password"
                      >
                        <FaCopy className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Share these credentials with the teacher</li>
                  <li>Teacher should log in and change their password</li>
                  <li>Teacher will need to confirm their email address</li>
                </ul>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}