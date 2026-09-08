import { useState, useEffect } from 'react'
import { useAuth } from '../../state/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserFriends,
  FaCalendarAlt,
  FaUserTag,
  FaSave,
  FaTimes,
  FaChild,
  FaUsers,
  FaArrowRight
} from 'react-icons/fa'

export default function ChildProfileConfirmation() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [childProfile, setChildProfile] = useState({
    id: '',
    first_name: '',
    last_name: '',
    full_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    home_address: '',
    bio: '',
    role: 'student',
    parent_id: null
  })
  const [parentInfo, setParentInfo] = useState(null)
  const [profileCreated, setProfileCreated] = useState(false)

  useEffect(() => {
    if (user?.id) {
      handleChildAuthentication(user)
    }
  }, [user])

  const handleChildAuthentication = async () => {
  try {
    setLoading(true)
    setError(null)

    console.log('========== CHILD PROFILE SETUP ==========')

    const {
      data: { user: currentUser },
      error: userError
    } = await supabase.auth.getUser()

    console.log('1. AUTH USER:', currentUser)
    console.log('2. AUTH ERROR:', userError)

    if (userError) throw userError

    if (!currentUser) {
      throw new Error('User is not authenticated')
    }

    console.log('3. USER ID:', currentUser.id)
    console.log('4. EMAIL:', currentUser.email)
    console.log('5. EMAIL CONFIRMED:', currentUser.email_confirmed_at)
    console.log('6. USER METADATA:', currentUser.user_metadata)

    const metadata = currentUser.user_metadata || {}

    console.log('7. PARENT ID:', metadata.parent_id)
    console.log('8. FIRST NAME:', metadata.first_name)
    console.log('9. LAST NAME:', metadata.last_name)
    console.log('10. DATE OF BIRTH:', metadata.date_of_birth)
    console.log('11. GENDER:', metadata.gender)
    console.log('12. HOME ADDRESS:', metadata.home_address)

    if (!currentUser.email_confirmed_at) {
      throw new Error(
        'Email has not been confirmed yet.'
      )
    }

    const newProfile = {
      id: currentUser.id,
      first_name: metadata.first_name || '',
      last_name: metadata.last_name || '',
      full_name:
        metadata.full_name ||
        `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim(),
      email: currentUser.email,
      date_of_birth: metadata.date_of_birth || null,
      gender: metadata.gender || null,
      home_address: metadata.home_address || null,
      bio: metadata.bio || null,
      role: 'student',
      parent_id: metadata.parent_id || null,
      updated_at: new Date().toISOString()
    }

    console.log('13. PROFILE WE ARE ABOUT TO SAVE:', newProfile)

    const { data: savedProfile, error: saveError } = await supabase
      .from('profiles')
      .upsert(newProfile, {
        onConflict: 'id'
      })
      .select()
      .single()

    console.log('14. SAVED PROFILE:', savedProfile)
    console.log('15. SAVE ERROR:', saveError)

    if (saveError) {
      throw saveError
    }

    setChildProfile(savedProfile)
    setProfileCreated(true)
    setSuccess('Your profile has been set up successfully!')

    console.log('========== PROFILE SETUP COMPLETE ==========')

  } catch (err) {
    console.error('========== PROFILE SETUP FAILED ==========')
    console.error(err)

    setError(err.message || 'Failed to set up profile.')
  } finally {
    setLoading(false)
  }
}

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setChildProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!childProfile.id) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updates = {
        first_name: childProfile.first_name,
        last_name: childProfile.last_name,
        full_name: `${childProfile.first_name} ${childProfile.last_name}`.trim(),
        date_of_birth: childProfile.date_of_birth || null,
        gender: childProfile.gender || null,
        home_address: childProfile.home_address || null,
        bio: childProfile.bio || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', childProfile.id)

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
    if (user?.id) {
      handleChildAuthentication(user)
    }
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard/student')
  }

  const getGenderIcon = () => {
    if (childProfile.gender === 'male') return <FaUserTag className="text-[#faa853]" />
    if (childProfile.gender === 'female') return <FaUserTag className="text-[#faa853]" />
    return <FaUser className="text-[#faa853]" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#faa853] animate-spin mx-auto mb-4" />
          <p className="text-[#2d3f5d] font-medium">Setting up your profile...</p>
          <p className="text-sm text-[#2d3f5d]/60 mt-2">
            Please wait while we complete your account setup
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <FaExclamationTriangle className="text-5xl text-[#faa853] mx-auto mb-3" />
          <p className="text-[#2d3f5d] text-lg font-semibold">Please Log In</p>
          <p className="text-[#2d3f5d]/60 mt-2">You need to be logged in to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] transition-colors"
          >
            Go to Login
          </button>
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
                  <FaChild className="w-8 h-8 text-[#faa853]" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-[#2d3f5d]">
                    {childProfile.full_name || 'Student Profile'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-[#2d3f5d]/60 capitalize">
                      {childProfile.role || 'Student'}
                    </span>
                    <span className="text-[#2d3f5d]/30">•</span>
                    <span className="text-sm text-[#2d3f5d]/60 flex items-center gap-1">
                      <FaEnvelope className="text-xs" />
                      {childProfile.email}
                    </span>
                  </div>
                  {parentInfo && (
                    <div className="flex items-center gap-2 mt-1">
                      <FaUsers className="text-xs text-[#faa853]" />
                      <span className="text-xs text-[#2d3f5d]/60">
                        Parent: {parentInfo.first_name} {parentInfo.last_name}
                      </span>
                      {parentInfo.email && (
                        <>
                          <span className="text-[#2d3f5d]/20">•</span>
                          <span className="text-xs text-[#2d3f5d]/60">
                            {parentInfo.email}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {profileCreated && (
                    <div className="mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Profile Complete
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                {!isEditing && childProfile.id && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] transition-colors flex items-center gap-2"
                  >
                    <FaUser className="text-sm" />
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
                        value={childProfile.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{childProfile.first_name || 'Not set'}</p>
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
                        value={childProfile.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{childProfile.last_name || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaEnvelope className="inline mr-1 text-[#faa853]" />
                      Email
                    </label>
                    <p className="text-[#2d3f5d] font-medium py-2">{childProfile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaCalendarAlt className="inline mr-1 text-[#faa853]" />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="date_of_birth"
                        value={childProfile.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">
                        {childProfile.date_of_birth ? new Date(childProfile.date_of_birth).toLocaleDateString() : 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaUserTag className="inline mr-1 text-[#faa853]" />
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={childProfile.gender}
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
                          {childProfile.gender || 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaMapMarkerAlt className="inline mr-1 text-[#faa853]" />
                      Home Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="home_address"
                        value={childProfile.home_address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors text-[#2d3f5d]"
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    ) : (
                      <p className="text-[#2d3f5d] font-medium py-2">{childProfile.home_address || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-[#2d3f5d]/60 uppercase tracking-wider mb-1">
                      <FaUser className="inline mr-1 text-[#faa853]" />
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={childProfile.bio}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-transparent outline-none transition-colors resize-none text-[#2d3f5d]"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-[#2d3f5d] py-2">{childProfile.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                {/* Go to Dashboard Button - Always visible */}
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="px-6 py-2.5 bg-[#2d3f5d] text-white rounded-lg hover:bg-[#1a2a3d] transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                >
                  <FaArrowRight className="text-sm" />
                  Go to Dashboard
                </button>

                {/* Edit/Save Buttons - Only visible when editing */}
                {isEditing && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-[#2d3f5d] hover:bg-gray-50 transition-colors font-medium"
                    >
                      <FaTimes className="inline mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}