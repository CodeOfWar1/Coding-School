import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FaTachometerAlt, 
  FaFileAlt, 
  FaUsers, 
  FaBook, 
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaUserGraduate,
  FaClipboardList,
  FaHourglassHalf,
  FaUniversity,
  FaPlus
} from 'react-icons/fa'
import AdminApplications from '../components/Admin/AdminApplications'
import AdminStudents from '../components/Admin/AdminStudent'
import AdminCourses from '../components/Admin/AdminCourses'
import AdminTeachers from '../components/Admin/AdminTeachers'
import { useAuth } from '../state/AuthContext'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <FaTachometerAlt className="text-lg" /> },
  { id: 'applications', label: 'Applications', icon: <FaFileAlt className="text-lg" /> },
  { id: 'students', label: 'Students', icon: <FaUsers className="text-lg" /> },
  { id: 'courses', label: 'Courses', icon: <FaBook className="text-lg" /> },
  { id: 'teachers', label: 'Teachers', icon: <FaChalkboardTeacher className="text-lg" /> },
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalCourses: 0,
    totalTeachers: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const { user, profile, logout } = useAuth()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      const { data: applications, count: appCount } = await supabase
        .from('application')
        .select('*', { count: 'exact' })
        .not('progress', 'eq', 'completed')
        .not('status', 'eq', 'approved')
        .not('status', 'eq', 'rejected')

      const pendingApps = applications?.filter(a => a.status === 'awaiting_approval').length || 0

      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      const { count: teacherCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher')

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      setStats({
        totalStudents: studentCount || 0,
        totalApplications: appCount || 0,
        pendingApplications: pendingApps,
        totalCourses: courseCount || 0,
        totalTeachers: teacherCount || 0,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
    const { error } = await supabase.from('landing_content').upsert(buildLandingUpsertPayload(content))
    if (error) {
      setToast(error.message || 'Save failed. Add missing columns in Supabase (see supabase/landing_content_extend.sql).')
      return
    }
    await loadAll()
    setToast('Website content saved.')
  }

  const addGalleryItem = () => {
    setContent((p) => ({
      ...p,
      gallery_items: [...(p.gallery_items || []), { title: 'Photo title', image_url: '' }],
    }))
  }

  const removeGalleryItem = (idx) => {
    setContent((p) => ({
      ...p,
      gallery_items: (p.gallery_items || []).filter((_, i) => i !== idx),
    }))
  }

  const patchGalleryItem = (idx, field, value) => {
    setContent((p) => {
      const items = [...(p.gallery_items || [])]
      items[idx] = { ...items[idx], [field]: value }
      return { ...p, gallery_items: items }
    })
  }

  const addPartnerItem = () => {
    setContent((p) => ({
      ...p,
      partners_items: [...(p.partners_items || []), { name: 'Partner name', logo_url: '', activity_summary: '' }],
    }))
  }

  const removePartnerItem = (idx) => {
    setContent((p) => ({
      ...p,
      partners_items: (p.partners_items || []).filter((_, i) => i !== idx),
    }))
  }

  const patchPartnerItem = (idx, field, value) => {
    setContent((p) => {
      const items = [...(p.partners_items || [])]
      items[idx] = { ...items[idx], [field]: value }
      return { ...p, partners_items: items }
    })
  }

  const uploadGalleryFile = async (idx, fileList) => {
    const file = fileList?.[0]
    if (!file) return
    const r = await uploadSiteMediaFile(file, 'gallery')
    if (r.error) {
      setToast(r.error)
      return
    }
    patchGalleryItem(idx, 'image_url', r.publicUrl)
    setToast('Image uploaded — save to publish on the public site.')
  }

  const uploadPartnerLogo = async (idx, fileList) => {
    const file = fileList?.[0]
    if (!file) return
    const r = await uploadSiteMediaFile(file, 'partners')
    if (r.error) {
      setToast(r.error)
      return
    }
    patchPartnerItem(idx, 'logo_url', r.publicUrl)
    setToast('Logo uploaded — save to publish.')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = user.profile?.first_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: <FaUserGraduate className="text-2xl" />, color: 'text-blue-600' },
    { label: 'Active Applications', value: stats.totalApplications, icon: <FaClipboardList className="text-2xl" />, color: 'text-purple-600' },
    { label: 'Pending Approval', value: stats.pendingApplications, icon: <FaHourglassHalf className="text-2xl" />, color: 'text-yellow-600' },
    { label: 'Total Courses', value: stats.totalCourses, icon: <FaUniversity className="text-2xl" />, color: 'text-green-600' },
    { label: 'Total Teachers', value: stats.totalTeachers, icon: <FaChalkboardTeacher className="text-2xl" />, color: 'text-orange-600' },
    { label: 'Total Revenue', value: `K${stats.totalRevenue.toLocaleString()}`, icon: <FaMoneyBillWave className="text-2xl" />, color: 'text-green-600' },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Header - Fixed */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden transition-colors"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#faa853] flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="font-semibold text-[#2d3f5d]">Admin Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-medium text-sm">
                {initials}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-[#2d3f5d]">
                {user.profile?.first_name || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed height, independent scroll */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* User Info - Fixed */}
          <div className="border-b border-gray-100 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#2d3f5d]">{user.profile?.first_name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-[#faa853]/10 text-[#faa853] font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#2d3f5d]'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Sign Out Button - Fixed at bottom */}
          <div className="border-t border-gray-100 p-3 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {/* Page Header - Sticky */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold text-[#2d3f5d] md:text-2xl">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-6">
            {activeSection === 'overview' && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
                  </div>
                ) : (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                      {statCards.map((stat, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#faa853]/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-gray-400">{stat.icon}</div>
                            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                          </div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h2 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
                        <FaPlus className="text-[#faa853] text-sm" />
                        Quick Actions
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setActiveSection('applications')}
                          className="px-4 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors flex items-center gap-2"
                        >
                          <FaClipboardList className="text-sm" />
                          Review Applications ({stats.pendingApplications})
                        </button>
                        <button
                          onClick={() => setActiveSection('teachers')}
                          className="px-4 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <FaChalkboardTeacher className="text-sm" />
                          Invite Teacher
                        </button>
                        <button
                          onClick={() => setActiveSection('courses')}
                          className="px-4 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <FaPlus className="text-sm" />
                          Add Course
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeSection === 'applications' && <AdminApplications onRefresh={fetchStats} />}
            {activeSection === 'students' && <AdminStudents />}
            {activeSection === 'courses' && <AdminCourses />}
            {activeSection === 'teachers' && <AdminTeachers />}
          </div>
        </main>
      </div>
    </div>
  )
}