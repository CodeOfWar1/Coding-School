import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  FaSave, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaEdit, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaUserFriends, 
  FaInfoCircle,
  FaTimes,
  FaFemale,
  FaMale,
  FaUserTag
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    home_address: '',
    bio: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    can_use_photos: null,
    role: 'student'
  })

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
    }
  }, [user])

  const fetchProfile = async (userId) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          home_address: data.home_address || '',
          bio: data.bio || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          can_use_photos: data.can_use_photos ?? null,
          role: data.role || 'student'
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updates = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        full_name: `${profile.first_name} ${profile.last_name}`.trim(),
        phone: profile.phone,
        gender: profile.gender || null,
        home_address: profile.home_address || null,
        bio: profile.bio || null,
        emergency_contact_name: profile.emergency_contact_name || null,
        emergency_contact_phone: profile.emergency_contact_phone || null,
        can_use_photos: profile.can_use_photos,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    fetchProfile(user.id) // Reset to saved data
  }

  const getGenderIcon = () => {
    if (profile.gender === 'male') return <FaMale className="text-[#faa853]" />
    if (profile.gender === 'female') return <FaFemale className="text-[#faa853]" />
    return <FaUserTag className="text-[#faa853]" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#faa853] animate-spin mx-auto mb-4" />
          <p className="text-[#2d3f5d]">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-6 bg-gradient-to-r from-[#faa853]/10 to-[#faa853]/5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#faa853]/20 flex items-center justify-center">
                  <FaUser className="w-8 h-8 text-[#faa853]" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-[#2d3f5d]">
                    {profile.full_name || 'User'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-[#2d3f5d]/60 capitalize">
                      {profile.role}
                    </span>

                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] transition-colors flex items-center gap-2"
                  >
                    <FaEdit className="text-sm" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-[#2d3f5d] flex items-center gap-2">
              <FaExclamationTriangle className="text-[#faa853]" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-[#2d3f5d] flex items-center gap-2">
              <FaCheckCircle className="text-[#faa853]" />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-medium text-[#2d3f5d] flex items-center gap-2 mb-4">
                  <FaUser className="text-[#faa853]" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={profile.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{profile.first_name || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={profile.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{profile.last_name || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaEnvelope className="inline mr-1 text-[#faa853]" />
                      Email
                    </label>
                    <p className="text-[#2d3f5d] font-medium py-2">{profile.email}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaPhone className="inline mr-1 text-[#faa853]" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                        placeholder="+260 00-000-0000"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{profile.phone || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaUserTag className="inline mr-1 text-[#faa853]" />
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 py-2">
                        {getGenderIcon()}
                        <span className="text-[#2d3f5d] font-medium capitalize">
                          {profile.gender || 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaMapMarkerAlt className="inline mr-1 text-[#faa853]" />
                      Home Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="home_address"
                        value={profile.home_address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{profile.home_address || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaInfoCircle className="inline mr-1 text-[#faa853]" />
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors resize-none text-[#2d3f5d]"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-[#2d3f5d] py-2">{profile.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h2 className="text-lg font-medium text-[#2d3f5d] flex items-center gap-2 mb-4">
                  <FaUserFriends className="text-[#faa853]" />
                  Emergency Contact
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      Contact Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="emergency_contact_name"
                        value={profile.emergency_contact_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                        placeholder="Full name of emergency contact"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{profile.emergency_contact_name || 'Not set'}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaPhone className="inline mr-1 text-[#faa853]" />
                      Contact Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="emergency_contact_phone"
                        value={profile.emergency_contact_phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                        placeholder="+260 00-000-0000"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{profile.emergency_contact_phone || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h2 className="text-lg font-medium text-[#2d3f5d] flex items-center gap-2 mb-4">
                  <FaCheckCircle className="text-[#faa853]" />
                  Permissions
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="can_use_photos"
                        checked={profile.can_use_photos || false}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#faa853] focus:ring-[#faa853] focus:ring-2"
                      />
                      <label className="text-sm text-[#2d3f5d]">
                        Can we take pictures of your child for promotional (Social media ads) purposes?
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className={`${profile.can_use_photos ? 'text-[#faa853]' : 'text-gray-400'}`} />
                      <span className="text-[#2d3f5d]">
                        {profile.can_use_photos ? 'Consent given for promotional photos' : 'No consent for promotional photos'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-[#2d3f5d] hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}