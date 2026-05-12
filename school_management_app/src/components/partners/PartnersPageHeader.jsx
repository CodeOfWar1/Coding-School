import { FaArrowLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { SCHOOL_PROFILE } from '../../content/siteProfile'

export default function PartnersPageHeader() {
  return (
    <div className="bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] text-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
          <FaArrowLeft className="text-sm" />
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-black mb-4 animate-fade-in-up">Our partners</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-3xl animate-fade-in-up animation-delay-200">
          Schools and organizations that work with {SCHOOL_PROFILE.name} to bring coding and digital skills to more
          learners.
        </p>
      </div>
    </div>
  )
}
