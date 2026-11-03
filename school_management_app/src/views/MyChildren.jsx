import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import { supabase } from '../lib/supabase'
import AddChildModal from '../components/registration/AddChild'
import ChildDetail from './ChildDetails'
import {
  FaSpinner,
  FaUserGraduate,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaChild,
  FaExclamationTriangle,
  FaPlus,
  FaPhone,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa'

export default function ParentChildrenList() {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)

  useEffect(() => {
    if (user?.id) fetchChildren(user.id)
  }, [user])

  const fetchChildren = async (parentId) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('parent_id', parentId)
        .eq('role', 'student')
      if (error) throw error
      setChildren(data || [])
    } catch (err) {
      console.error('[ParentChildrenList] failed:', err)
      setError('Failed to load children. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChildAdded = () => {
    if (user?.id) fetchChildren(user.id)
  }

  const getGenderLabel = (gender) => {
    if (!gender) return 'Not specified'
    const labels = {
      male: 'Male',
      female: 'Female',
      other: 'Other',
      'prefer-not-to-say': 'Prefer not to say',
    }
    return labels[gender] || gender
  }

  // ---- Child detail view ----
  if (selectedChild) {
    return (
      <ChildDetail
        child={selectedChild}
        onBack={() => setSelectedChild(null)}
      />
    )
  }

  // ---- Loading / error ----
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <FaExclamationTriangle className="text-4xl text-[#faa853] mx-auto mb-3" />
        <p className="text-[#2d3f5d] font-medium">{error}</p>
        <button
          onClick={() => fetchChildren(user?.id)}
          className="mt-3 px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  // ---- List view ----
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
              <FaUsers className="text-[#faa853]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#2d3f5d]">
                Your Children
              </h2>
              <p className="text-sm text-[#2d3f5d]/60">
                {children.length} {children.length === 1 ? 'child' : 'children'}{' '}
                registered
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddChildModal(true)}
            className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] flex items-center gap-2 text-sm font-medium"
          >
            <FaPlus className="text-sm" />
            Add Child
          </button>
        </div>

        {children.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#faa853]/10 flex items-center justify-center mx-auto mb-4">
              <FaChild className="text-3xl text-[#faa853]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2d3f5d] mb-2">
              No Children Added Yet
            </h3>
            <p className="text-[#2d3f5d]/60 max-w-md mx-auto mb-4">
              You haven't added any children to your account yet. Click the "Add
              Child" button above to get started.
            </p>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e8993f] flex items-center gap-2 mx-auto"
            >
              <FaPlus className="text-sm" />
              Add Your First Child
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChild(child)}
                className="text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#faa853]/50 hover:shadow-md transition-all group"
              >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-[#faa853]/5 to-[#faa853]/10 border-b border-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#faa853]/20 flex items-center justify-center shrink-0">
                        <FaUserGraduate className="text-[#faa853] text-sm" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#2d3f5d] truncate">
                          {child.first_name} {child.last_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs bg-[#faa853]/10 text-[#faa853] px-2 py-0.5 rounded-full">
                            Student
                          </span>
                          {child.gender && (
                            <span className="text-xs text-[#2d3f5d]/60 capitalize">
                              • {getGenderLabel(child.gender)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <FaArrowRight className="text-[#faa853] text-sm group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-2">
                  {child.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaEnvelope className="text-[#faa853] text-xs w-4" />
                      <span className="text-[#2d3f5d]/70 truncate">
                        {child.email}
                      </span>
                    </div>
                  )}
                  {child.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaPhone className="text-[#faa853] text-xs w-4" />
                      <span className="text-[#2d3f5d]/70">{child.phone}</span>
                    </div>
                  )}
                  {child.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-[#faa853] text-xs w-4" />
                      <span className="text-[#2d3f5d]/70">
                        DOB:{' '}
                        {new Date(child.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {child.home_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <FaMapMarkerAlt className="text-[#faa853] text-xs w-4 mt-0.5" />
                      <span className="text-[#2d3f5d]/70 flex-1">
                        {child.home_address}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <span className="text-xs text-[#2d3f5d]/40">
                      Joined: {new Date(child.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onSuccess={() => {
          handleChildAdded()
          setShowAddChildModal(false)
        }}
      />
    </>
  )
}