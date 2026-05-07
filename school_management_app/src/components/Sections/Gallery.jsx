import { forwardRef, useState } from 'react'
import { FaTimes, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { SCHOOL_MEDIA_IMAGES } from '../../content/schoolMedia'

const GALLERY_IMAGES = [
  { title: 'Coding Projects', img: SCHOOL_MEDIA_IMAGES.hero },
  { title: 'Robotics Build Day', img: SCHOOL_MEDIA_IMAGES.lab },
  { title: 'Girls Tech Cohort', img: SCHOOL_MEDIA_IMAGES.classA },
  { title: 'Community Outreach', img: SCHOOL_MEDIA_IMAGES.social },
  { title: 'Game Design Studio', img: SCHOOL_MEDIA_IMAGES.classB },
  { title: 'Classroom Events', img: SCHOOL_MEDIA_IMAGES.classC },
]

const Gallery = forwardRef((_, ref) => {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <section id="gallery" ref={ref} className="py-5 md:py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3 animate-fade-in">
            Moments
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4 animate-slide-in-up">
            Our Learning Journey
          </h2>
          <p className="site-body max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Capturing the excitement, creativity, and growth at Anvil Tech Academy
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_IMAGES.map((item, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d3f5d]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-lg">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* See Our Gallery Button */}
        <div className="text-center mt-12 md:mt-16 animate-fade-in-up animation-delay-400">
          <Link
            to="/gallery"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white border-2 border-[#faa853] text-[#faa853] font-semibold hover:bg-[#faa853] hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <span>See Our Full Gallery</span>
            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-base text-gray-500 mt-3">
            Explore more memorable moments from our academy
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-[#faa853] transition-colors">
            <FaTimes size={32} />
          </button>
          <img src={selectedImage.img} alt={selectedImage.title} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </section>
  )
})

Gallery.displayName = 'Gallery'
export default Gallery