import { useEffect } from 'react'
import { FaSchool, FaChalkboardTeacher, FaLaptopCode, FaUsers, FaImage, FaEnvelope } from 'react-icons/fa'

const MOBILE_NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: FaSchool },
  { id: 'about', label: 'About', icon: FaChalkboardTeacher },
  { id: 'classes', label: 'Classes', icon: FaLaptopCode },
  { id: 'team', label: 'Team', icon: FaUsers },
  { id: 'gallery', label: 'Gallery', icon: FaImage },
  { id: 'contact', label: 'Contact', icon: FaEnvelope },
]

export default function MobileMenu({ isOpen, onClose, scrollToSection, onRegisterClick, onLoginClick, activeSection }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 md:hidden animate-slide-in-right">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-black text-[#2d3f5d]">Menu</h2>
          </div>
          
          <div className="flex-1 py-6">
            {MOBILE_NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-[#faa853]/10 text-[#faa853] border-l-4 border-[#faa853]'
                      : 'text-[#2d3f5d] hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Icon className="text-lg" />
                  <span className="font-semibold">{item.label}</span>
                </button>
              )
            })}
          </div>
          
          <div className="p-6 border-t border-gray-100 space-y-3">
            <button
              onClick={onLoginClick}
              className="w-full py-3 rounded-full border-2 border-[#faa853] text-[#faa853] font-semibold hover:bg-[#faa853] hover:text-white transition-all"
            >
              Login
            </button>
            <button
              onClick={onRegisterClick}
              className="w-full py-3 rounded-full bg-[#faa853] text-white font-semibold hover:bg-[#faa853]/90 transition-all"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}