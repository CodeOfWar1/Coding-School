import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../state/AuthContext'
import { FaBars, FaTimes, FaEnvelope, FaChevronDown, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'

/**
 * Shared student/applicant layout with clean design, no shadows, modern feel
 */
export default function AppShellLayout({
  children,
  navItems = [],
  activeNavId,
  onNavSelect,
  roleLabel = 'Student',
  pageTitle = 'Dashboard',
  breadcrumbLast,
  messageCount = 0,
  onMessagesClick,
}) {
  const { user, profile, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const displayName = profile?.full_name || profile?.first_name || user?.email?.split('@')[0] || 'User'
  const userRole = profile?.role || roleLabel
  const displayRole = userRole === 'student' ? 'Student' : userRole === 'applicant' ? 'Applicant' : userRole
  
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const crumb = breadcrumbLast || pageTitle

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close sidebar on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen])

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
  }

  // Safety check - if no navItems, don't render the navigation
  const hasNavItems = navItems && Array.isArray(navItems) && navItems.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - Clean, no shadow */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left side - Logo & Menu Button */}
          <div className="flex items-center gap-3">
            {hasNavItems && (
              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden transition-colors"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars className="h-5 w-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              
              <span className="font-semibold text-[#2d3f5d]">AnvilCodingAcademy</span>
            </div>
          </div>

          {/* Right side - Messages & User Menu */}
          <div className="flex items-center gap-2">
            {/* Messages Button */}
            {onMessagesClick && (
              <button
                onClick={onMessagesClick}
                className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Messages"
              >
                <FaEnvelope className="h-5 w-5" />
                {messageCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {messageCount > 9 ? '9+' : messageCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-medium text-sm">
                  {initials}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
                <FaChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-medium text-[#2d3f5d]">{displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{displayRole}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Mobile Drawer - Only render if there are nav items */}
        {hasNavItems && (
          <>
            <aside
              className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >

              {/* User Info in Sidebar */}
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faa853]/10 text-[#faa853] font-semibold">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#2d3f5d]">{displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{displayRole} Portal</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-3">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = activeNavId === item.id
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            onNavSelect?.(item.id)
                            setSidebarOpen(false)
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-[#faa853]/10 text-[#faa853] font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-[#2d3f5d]'
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge != null && item.badge > 0 && (
                            <span className="rounded-full bg-[#faa853]/20 px-2 py-0.5 text-xs font-medium text-[#faa853]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Sidebar Footer */}
              <div className="border-t border-gray-100 p-3">
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
              <div
                className="fixed inset-0 z-30 bg-black/30 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* Main Content */}
        <main className={`min-w-0 flex-1 ${!hasNavItems ? 'w-full' : ''}`}>
          {/* Page Header */}
          <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-[#2d3f5d] md:text-2xl">{pageTitle}</h1>
              <nav className="text-sm text-gray-400">
                {crumb}
              </nav>
            </div>
          </div>
          
          {/* Page Content */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}