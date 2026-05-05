import { useState, useEffect } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import MobileMenu from './MobileManu'
import logoImage from "../../assets/logo.png";

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'classes', label: 'Classes' },
  { id: 'team', label: 'Team' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'partners', label: 'Partners' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar({ activeSection, scrollToSection, onRegisterClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogin = () => {
    navigate('/login')
  }

  const handleNavClick = (itemId) => {
    scrollToSection(itemId)
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-md py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo Image */}
            <button 
              onClick={() => scrollToSection('home')}
              className="flex items-center transition-transform duration-300 hover:scale-105"
            >
              <img 
                src={logoImage} 
                alt="AnvilCoding Academy Logo" 
                className="h-14 w-auto md:h-16 object-contain"
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative group ${
                    activeSection === item.id
                      ? 'text-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full animate-fade-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleLogin}
                className="px-6 py-2 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={onRegisterClick}
                className="px-6 py-2 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-md hover:shadow-lg"
              >
                Register Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-secondary hover:bg-primary/10 transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        scrollToSection={(section) => {
          scrollToSection(section)
          setIsMobileMenuOpen(false)
        }}
        onRegisterClick={() => {
          onRegisterClick()
          setIsMobileMenuOpen(false)
        }}
        onLoginClick={() => {
          navigate('/login')
          setIsMobileMenuOpen(false)
        }}
        activeSection={activeSection}
      />
    </>
  )
}