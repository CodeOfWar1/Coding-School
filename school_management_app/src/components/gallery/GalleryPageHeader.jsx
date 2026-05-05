import { FaArrowLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function GalleryPageHeader() {
  return (
    <div className="bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] text-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
          <FaArrowLeft className="text-sm" />
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-black mb-4 animate-fade-in-up">Our Gallery</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl animate-fade-in-up animation-delay-200">
          Explore memorable moments from our coding classes, robotics workshops, and community events
        </p>
      </div>
    </div>
  )
}
